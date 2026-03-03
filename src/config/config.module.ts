import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import z from "zod";
import { envSchema } from "./env.schema";
import { buildAppConfig } from "./app.config";
import { AppConfigService } from "./config.service";
import { buildAppConfiguration } from ".";
import { deepFreeze } from "src/common/utils/deep-freeze";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const parsed = envSchema.safeParse(config);

        if(!parsed.success) {
          console.error('Config Error: Invalid environment variables: ', z.treeifyError(parsed.error))
          process.exit(1);
        }

        return parsed.data;
      }
    })
  ],
  providers: [
    {
      provide: 'APP_CONFIGURATION',
      useFactory: () => {
        const env = envSchema.parse(process.env);
        const config = buildAppConfiguration(env);
        return deepFreeze(config);
      }
    },
    AppConfigService
  ],
  exports: [
    'APP_CONFIGURATION',
    AppConfigService
  ]
})
export class AppConfigModule {}