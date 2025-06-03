import logger from '../logger';

class PoolsUpdater {
  public async updatePoolsJson(): Promise<void> {
    logger.info('Pools JSON update - using existing pools.b1t.json');
  }
}

export default new PoolsUpdater(); 