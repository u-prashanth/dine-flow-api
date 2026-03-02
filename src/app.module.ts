import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { LoggerModule } from './common/logger/logger.module';
import { CorrelationMiddleware } from './common/middleware/correlation.middleware';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
