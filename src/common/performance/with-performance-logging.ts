import { RequestContextService } from "../context/request-context.service";
import { LoggerService } from "../logger/logger.service";

export async function withPerformanceLogging<T>(
  context: RequestContextService,
  logger: LoggerService,
  spanName: string,
  fn: () => Promise<T>
) {
  context.startSpan(spanName);

  try {
    const result = await fn();
    const spanInfo = context.endSpan();

    logger.debug('Span completed', {
      traceId: context.traceId,
      spanId: spanInfo.spanId,
      parentSpanId: spanInfo.parentSpanId,
      name: spanInfo.name,
      durationMs: spanInfo.durationMs
    });

    return result;
  } catch (error) {
    const spanInfo = context.endSpan();

    logger.warn('Span failed', {
      traceId: context.traceId,
      spanId: spanInfo.spanId,
      parentSpanId: spanInfo.parentSpanId,
      name: spanInfo.name,
      durationMs: spanInfo.durationMs
    });

    throw error;
  }
}