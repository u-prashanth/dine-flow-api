import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { LoggerModule } from './common/logger/logger.module';
import { CorrelationMiddleware } from './common/middleware/correlation.middleware';
import { APP_FILTER, APP_INTERCEPTOR, ModuleRef } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ContextModule } from './common/context/context.module';
import { MetricsService } from './common/metrics/metrics.service';
import { TracingHelper } from './common/tracing/tracing.helper';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './common/metrics/metrics.module';

@Module({
  imports: [
    AppConfigModule,
    ContextModule,
    LoggerModule,
    MetricsModule,
    HealthModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    }
  ],
})
export class AppModule implements NestModule {
  constructor(moduleRef: ModuleRef) {
    TracingHelper.setModuleRef(moduleRef);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
