import { Injectable } from "@nestjs/common";
import { PerformanceTimer } from "src/common/performance/performance-timer";
import { DrizzleService } from "src/infrastructure/database/drizzle.service";
import { RedisService } from "src/infrastructure/redis/redis.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly redis: RedisService
  ) {}

  async check() {
    const dbTimer = new PerformanceTimer();
    const dbHealthy = await this.drizzle.checkConnection();
    const dbLatency = dbTimer.stop();

    const redisTimer = new PerformanceTimer();
    const redisHealthy = await this.redis.checkConnection();
    const redisLatency = redisTimer.stop();

    const allHealthy = dbHealthy && redisHealthy;

    return {
      status: allHealthy ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealthy ? 'up' : 'down',
          responseTimeMs: dbLatency
        },
        redis: {
          status: redisHealthy ? 'up' : 'down',
          responseTimeMs: redisLatency
        }
      }
    }
  }
}