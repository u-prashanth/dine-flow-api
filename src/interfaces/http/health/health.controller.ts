import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { MetricsService } from "src/common/metrics/metrics.service";
import { HealthService } from "./health.service";

@Controller('health')
export class HealthController {
  constructor(
    private readonly metrics: MetricsService,
    private readonly healthService: HealthService
  ) {}

  @Get()
  async health() {
    const result = await this.healthService.check();

    if (result.status !== 'ok') {
      throw new ServiceUnavailableException('One or more dependencies are unavailable');
    }

    return result;
  }

  @Get('metrics')
  metricsSnapshot() {
    return {
      metrics: this.metrics.getAll()
    }
  }
}