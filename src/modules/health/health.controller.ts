import { Controller, Get } from "@nestjs/common";
import { MetricsService } from "src/common/metrics/metrics.service";

@Controller('health')
export class HealthController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  }

  @Get('metrics')
  metricsSnapshot() {
    return {
      metrics: this.metrics.getAll()
    }
  }
}