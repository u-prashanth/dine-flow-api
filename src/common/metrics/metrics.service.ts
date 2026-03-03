import { Injectable } from "@nestjs/common";
import { MetricName } from "./metrics.enum";
import { ErrorCode } from "../errors/error-code.enum";

@Injectable()
export class MetricsService {
  private counters: Map<string, number> = new Map();

  recordHttpRequest(statusCode: number): void {
    this.increment(MetricName.HTTP_REQUESTS_TOTAL);
    this.increment(`http_status_${statusCode}`);
  }

  recordHttpFailure(statusCode: number): void {
    this.increment(MetricName.HTTP_REQUESTS_FAILED_TOTAL);
    this.increment(`http_status_${statusCode}`);
  }

  recordApplicationError(errorCode: ErrorCode, statusCode: number): void {
    this.increment(MetricName.ERRORS_TOTAL);
    this.increment(`errors_by_code_${errorCode}`);
    this.increment(`errors_by_status_${statusCode}`);
  }

  getAll(): Record<string, number> {
    return Object.fromEntries(this.counters);
  }

  private increment(metricName: string): void {
    const current = this.counters.get(metricName) ?? 0;
    this.counters.set(metricName, current + 1);
  }
}