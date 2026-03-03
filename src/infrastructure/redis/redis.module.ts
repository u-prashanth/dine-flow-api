import { Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { AppConfigModule } from "src/config/config.module";

@Module({
  imports: [AppConfigModule],
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule {}