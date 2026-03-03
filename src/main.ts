import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableShutdownHooks();

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS
  app.enableCors({
    origin: '*',
    credentials: true
  });

  // Disable Express Signature
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Proxy
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Server running on port ${port}`);
}

bootstrap();