import { Injectable } from "@nestjs/common";
import { MetricName } from "./metrics.enum";
import { ErrorCode } from "../errors/error-code.enum";

@Injectable()
export class MetricsService {
  private counters: Map<string, number> = new Map();
  private readonly latencyBuckets = [
    5,
    10,
    25,
    50,
    100,
    250,
    500,
    1000,
    2500,
    5000
  ];
  private latencySum = 0;
  private latencyCount = 0;
  private httpSuccessCount = 0;
  private httpClientErrorCount = 0;
  private httpServerErrorCount = 0;

  recordHttpRequest(statusCode: number): void {
    this.increment(MetricName.HTTP_REQUESTS_TOTAL);
    this.increment(`http_status_${statusCode}`);

    if (statusCode >= 200 && statusCode < 400) {
      this.httpSuccessCount++;
    } else if (statusCode >= 400 && statusCode < 500) {
      this.httpClientErrorCount++;
    } else if (statusCode >= 500) {
      this.httpServerErrorCount++;
    }
  }

  recordApplicationError(errorCode: ErrorCode, statusCode: number): void {
    this.increment(MetricName.ERRORS_TOTAL);
    this.increment(`errors_by_code_${errorCode}`);
    this.increment(`errors_by_status_${statusCode}`);
  }

  recordHttpLatency(durationMs: number): void {
    this.latencyCount++;
    this.latencySum += durationMs;

    let bucketFound = false;

    for (const bucket of this.latencyBuckets) {
      if (durationMs <= bucket) {
        this.increment(`http_request_duration_ms_bucket_le_${bucket}`);
        bucketFound = true;
        break;
      }
    }

    if(!bucketFound) {
      this.increment(`http_request_duration_ms_bucket_gt_${this.latencyBuckets[this.latencyBuckets.length - 1]}`);
    }

    this.increment(`http_request_duration_ms_count`);
    this.increment(`http_request_duration_ms_sum`, durationMs);
  }

  getHttpReliabilityStatus() {
    const total = 
      this.httpSuccessCount +
      this.httpClientErrorCount +
      this.httpServerErrorCount;

    if (total === 0) {
      return {
        successRate: 100,
        failureRate: 0,
        serverErrorRate: 0
      };
    }

    const successRate = (this.httpSuccessCount / total) * 100;
    const failureRate = ((this.httpClientErrorCount + this.httpServerErrorCount) / total) * 100;
    const serverErrorRate = (this.httpServerErrorCount / total) * 100;

    return {
      successRate,
      failureRate,
      serverErrorRate
    };
  }

  getAll(): Record<string, number> {
    return Object.fromEntries(this.counters);
  }

  private increment(metricName: string, value: number = 1): void {
    const current = this.counters.get(metricName) ?? 0;
    this.counters.set(metricName, current + value);
  }
}