import { Pool } from "pg";
import { BeforeApplicationShutdown, Injectable } from "@nestjs/common";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { AppConfigService } from "src/config/config.service";
import * as schema from "./schemas";

@Injectable()
export class DrizzleService implements BeforeApplicationShutdown {
  private pool: Pool
  private isClosed: boolean = false;
  public readonly db: NodePgDatabase<typeof schema>;

  constructor(private readonly config: AppConfigService) {
    this.pool = new Pool({
      connectionString: config.database.url,
      max: config.database.poolSize,
      ssl: config.database.enableSSL
        ? { rejectUnauthorized: false }
        : false
    });

    this.db = drizzle(this.pool, { schema });
  }

  async beforeApplicationShutdown() {
    if (this.isClosed) return;
    this.isClosed = true;
    await this.pool.end();
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}