import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { MetricsModule } from "src/common/metrics/metrics.module";
import { HealthService } from "./health.service";
import { DrizzleModule } from "src/infrastructure/database/drizzle.module";
import { RedisModule } from "src/infrastructure/redis/redis.module";

@Module({
  imports: [
    MetricsModule,
    DrizzleModule,
    RedisModule
  ],
  providers: [HealthService],
  controllers: [HealthController]
})
export class HealthModule {}