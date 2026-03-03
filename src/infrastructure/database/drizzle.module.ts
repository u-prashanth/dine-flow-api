import { Module } from "@nestjs/common";
import { DrizzleService } from "./drizzle.service";
import { AppConfigModule } from "src/config/config.module";

@Module({
  imports: [AppConfigModule],
  providers: [DrizzleService],
  exports: [DrizzleService]
})
export class DrizzleModule {}