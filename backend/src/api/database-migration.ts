import logger from '../logger';

class DatabaseMigration {
  public async $blocksReindexingTruncate(): Promise<void> {
    logger.info('Blocks reindexing truncate - skipped for Bit implementation');
  }

  public async $initializeOrMigrateDatabase(): Promise<void> {
    logger.info('Database initialization/migration - skipped for Bit implementation');
  }
}

export default new DatabaseMigration(); 