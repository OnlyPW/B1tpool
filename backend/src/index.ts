import express from 'express';
import { Application, Request, Response, NextFunction } from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import bitcoinApi from './api/bitcoin/bitcoin-api-factory';
import cluster from 'cluster';
import DB from './database';
import config from './config';
import blocks from './api/blocks';
import memPool from './api/mempool';
import diskCache from './api/disk-cache';
import statistics from './api/statistics/statistics';
import websocketHandler from './api/websocket-handler';
import logger from './logger';
import backendInfo from './api/backend-info';
import loadingIndicators from './api/loading-indicators';
import mempool from './api/mempool';
import databaseMigration from './api/database-migration';
import syncAssets from './sync-assets';
import { Common } from './api/common';
import poolsUpdater from './tasks/pools-updater';
import indexer from './indexer';
import nodesRoutes from './api/explorer/nodes.routes';
import channelsRoutes from './api/explorer/channels.routes';
import generalLightningRoutes from './api/explorer/general.routes';
import lightningStatsUpdater from './tasks/lightning/stats-updater.service';
import networkSyncService from './tasks/lightning/network-sync.service';
import statisticsRoutes from './api/statistics/statistics.routes';
import miningRoutes from './api/mining/mining-routes';
import bitcoinRoutes from './api/bitcoin/bitcoin.routes';
import fundingTxFetcher from './tasks/lightning/sync-tasks/funding-tx-fetcher';
import forensicsService from './tasks/lightning/forensics.service';
import priceUpdater from './tasks/price-updater';
import chainTips from './api/chain-tips';
import { AxiosError } from 'axios';
import v8 from 'v8';
import { formatBytes, getBytesUnit } from './utils/format';

class Server {
  private wss: WebSocket.Server | undefined;
  private server: http.Server | undefined;
  private app: Application;
  private currentBackendRetryInterval = 1;
  private backendRetryCount = 0;

  private maxHeapSize: number = 0;
  private heapLogInterval: number = 60;
  private warnedHeapCritical: boolean = false;
  private lastHeapLogTime: number | null = null;

  constructor() {
    this.app = express();

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      if (this.server) {
        this.server.close(async () => {
          logger.info('HTTP server closed.');
          if (config.DATABASE.ENABLED) {
            await DB.closePool();
          }
          process.exit(0);
        });
      } else {
        if (config.DATABASE.ENABLED) {
          DB.closePool().finally(() => process.exit(0));
        } else {
          process.exit(0);
        }
      }

      // Force shutdown after a timeout
      setTimeout(() => {
        logger.warn('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10000); // 10 Sekunden Timeout
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Für Strg+C

    if (!config.MEMPOOL.SPAWN_CLUSTER_PROCS) {
      this.startServer();
      return;
    }

    if (cluster.isPrimary) {
      logger.notice(`Mempool Server (Master) is running on port ${config.MEMPOOL.HTTP_PORT} (${backendInfo.getShortCommitHash()})`);

      const numCPUs = config.MEMPOOL.SPAWN_CLUSTER_PROCS;
      for (let i = 0; i < numCPUs; i++) {
        const env = { workerId: i };
        const worker = cluster.fork(env);
        worker.process['env'] = env;
      }

      cluster.on('exit', (worker, code, signal) => {
        const workerId = worker.process['env'].workerId;
        logger.warn(`Mempool Worker PID #${worker.process.pid} workerId: ${workerId} died. Restarting in 10 seconds... ${signal || code}`);
        setTimeout(() => {
          const env = { workerId: workerId };
          const newWorker = cluster.fork(env);
          newWorker.process['env'] = env;
        }, 10000);
      });
    } else {
      this.startServer(true);
    }
  }

  async startServer(worker = false): Promise<void> {
    logger.notice(`Starting Mempool Server${worker ? ' (worker)' : ''}... (${backendInfo.getShortCommitHash()})`);

    if (config.DATABASE.ENABLED) {
      await DB.checkDbConnection();
      try {
        if (process.env.npm_config_reindex_blocks === 'true') { // Re-index requests
          await databaseMigration.$blocksReindexingTruncate();
        }
        await databaseMigration.$initializeOrMigrateDatabase();
      } catch (e) {
        throw new Error(e instanceof Error ? e.message : 'Error');
      }
    }

    this.app
      .use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      })
      .use(express.urlencoded({ extended: true }))
      .use(express.text({ type: ['text/plain', 'application/base64'] }))
      ;

    if (config.DATABASE.ENABLED) {
      await priceUpdater.$initializeLatestPriceWithDb();
    }

    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });

    this.setUpWebsocketHandling();

    await poolsUpdater.updatePoolsJson(); // Needs to be done before loading the disk cache because we sometimes wipe it
    await syncAssets.syncAssets$();
    if (config.MEMPOOL.ENABLED) {
      await diskCache.$loadMempoolCache();
    }

    if (config.STATISTICS.ENABLED && config.DATABASE.ENABLED && cluster.isPrimary) {
      statistics.startStatistics();
    }

    priceUpdater.$run();
    await chainTips.updateOrphanedBlocks();

    this.setUpHttpApiRoutes();

    if (config.MEMPOOL.ENABLED) {
      this.runMainUpdateLoop();
    }

    setInterval(() => { this.healthCheck(); }, 2500);

    if (config.LIGHTNING.ENABLED) {
      this.$runLightningBackend();
    }

    this.server.listen(config.MEMPOOL.HTTP_PORT, () => {
      if (worker) {
        logger.info(`Mempool Server worker #${process.pid} started on port ${config.MEMPOOL.HTTP_PORT}`);
      } else {
        logger.notice(`Mempool Server is running on port ${config.MEMPOOL.HTTP_PORT}`);
      }
    });

    this.server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        logger.err(`Unexpected server error: ${error.message}${error.stack ? '\nStack: ' + error.stack : ''}`);
        process.exit(1);
        return;
      }
      switch (error.code) {
        case 'EACCES':
          logger.err(`Port ${config.MEMPOOL.HTTP_PORT} requires elevated privileges. Exiting. Error: ${error.message}`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.err(`Port ${config.MEMPOOL.HTTP_PORT} is already in use. Exiting. Error: ${error.message}`);
          process.exit(1);
          break;
        default:
          logger.err(`Unhandled server error on listen: ${error.code}. Exiting. Error: ${error.message}${error.stack ? '\nStack: ' + error.stack : ''}`);
          process.exit(1);
          break;
      }
    });
  }

  async runMainUpdateLoop(): Promise<void> {
    try {
      try {
        await memPool.$updateMemPoolInfo();
      } catch (e) {
        const msg = `updateMempoolInfo: ${(e instanceof Error ? e.message : e)}`;
        if (config.MEMPOOL.USE_SECOND_NODE_FOR_MINFEE) {
          logger.warn(msg);
        } else {
          logger.debug(msg);
        }
      }
      const newMempool = await bitcoinApi.$getRawMempool();
      const numHandledBlocks = await blocks.$updateBlocks();
      if (numHandledBlocks === 0) {
        await memPool.$updateMempool(newMempool);
      }
      indexer.$run();

      // rerun immediately if we skipped the mempool update, otherwise wait POLL_RATE_MS
      setTimeout(this.runMainUpdateLoop.bind(this), numHandledBlocks > 0 ? 1 : config.MEMPOOL.POLL_RATE_MS);
      this.backendRetryCount = 0;
    } catch (e: any) {
      this.backendRetryCount++;
      let loggerMsg = `Exception in runMainUpdateLoop() (count: ${this.backendRetryCount}). Retrying in ${this.currentBackendRetryInterval} sec.`;
      loggerMsg += ` Reason: ${(e instanceof Error ? e.message : e)}.`;
      if (e?.stack) {
        loggerMsg += ` Stack trace: ${e.stack}`;
      }
      // When we get a first Exception, only `logger.debug` it and retry after 5 seconds
      // From the second Exception, `logger.warn` the Exception and increase the retry delay
      if (this.backendRetryCount >= 5) {
        logger.warn(loggerMsg);
        mempool.setOutOfSync();
      } else {
        logger.debug(loggerMsg);
      }
      if (e instanceof AxiosError) {
        logger.debug(`AxiosError: ${e?.message}`);
      }
      setTimeout(this.runMainUpdateLoop.bind(this), 1000 * this.currentBackendRetryInterval);
    } finally {
      diskCache.unlock();
    }
  }

  async $runLightningBackend(): Promise<void> {
    try {
      await fundingTxFetcher.$init();
      await networkSyncService.$startService();
      await lightningStatsUpdater.$startService();
      await forensicsService.$startService();
    } catch(e) {
      logger.err(`Exception in $runLightningBackend. Restarting in 1 minute. Reason: ${(e instanceof Error ? e.message : e)}`);
      await Common.sleep$(1000 * 60);
      this.$runLightningBackend();
    };
  }

  setUpWebsocketHandling(): void {
    if (this.wss) {
      websocketHandler.setWebsocketServer(this.wss);
    }
    websocketHandler.setupConnectionHandling();
    if (config.MEMPOOL.ENABLED) {
      statistics.setNewStatisticsEntryCallback(websocketHandler.handleNewStatistic.bind(websocketHandler));
      memPool.setAsyncMempoolChangedCallback(websocketHandler.$handleMempoolChange.bind(websocketHandler));
      blocks.setNewAsyncBlockCallback(websocketHandler.handleNewBlock.bind(websocketHandler));
    }
    priceUpdater.setRatesChangedCallback(websocketHandler.handleNewConversionRates.bind(websocketHandler));
    loadingIndicators.setProgressChangedCallback(websocketHandler.handleLoadingChanged.bind(websocketHandler));
  }
  
  setUpHttpApiRoutes(): void {
    bitcoinRoutes.initRoutes(this.app);
    if (config.STATISTICS.ENABLED && config.DATABASE.ENABLED && config.MEMPOOL.ENABLED) {
      statisticsRoutes.initRoutes(this.app);
    }
    if (Common.indexingEnabled() && config.MEMPOOL.ENABLED) {
      miningRoutes.initRoutes(this.app);
    }
    if (config.LIGHTNING.ENABLED) {
      generalLightningRoutes.initRoutes(this.app);
      nodesRoutes.initRoutes(this.app);
      channelsRoutes.initRoutes(this.app);
    }
  }

  healthCheck(): void {
    const now = Date.now();
    const stats = v8.getHeapStatistics();
    this.maxHeapSize = Math.max(stats.used_heap_size, this.maxHeapSize);
    const warnThreshold = 0.8 * stats.heap_size_limit;

    const byteUnits = getBytesUnit(Math.max(this.maxHeapSize, stats.heap_size_limit));

    if (!this.warnedHeapCritical && this.maxHeapSize > warnThreshold) {
      this.warnedHeapCritical = true;
      logger.warn(`Used ${(this.maxHeapSize / stats.heap_size_limit * 100).toFixed(2)}% of heap limit (${formatBytes(this.maxHeapSize, byteUnits, true)} / ${formatBytes(stats.heap_size_limit, byteUnits)})!`);
    }
    if (this.lastHeapLogTime === null || (now - this.lastHeapLogTime) > (this.heapLogInterval * 1000)) {
      logger.debug(`Memory usage: ${formatBytes(this.maxHeapSize, byteUnits)} / ${formatBytes(stats.heap_size_limit, byteUnits)}`);
      this.warnedHeapCritical = false;
      this.maxHeapSize = 0;
      this.lastHeapLogTime = now;
    }
  }
}

((): Server => new Server())();
