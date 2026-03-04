import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/infrastructure/database/drizzle.module";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminAuthService } from "src/application/auth/services/admin-auth.service";
import { AdminRepository } from "src/infrastructure/database/repositories/admin.repository";
import { JwtService } from "src/infrastructure/auth/jwt.service";
import { PasswordService } from "src/infrastructure/auth/password.service";
import { RolesGuard } from "./guards/roles.guard";
import { AdminAuthGuard } from "./guards/admin-auth.guard";
import { AppConfigModule } from "src/config/config.module";
import { LoggerModule } from "src/common/logger/logger.module";
import { ContextModule } from "src/common/context/context.module";

@Module({
  imports: [
    DrizzleModule,
    AppConfigModule,
    LoggerModule,
    ContextModule
  ],
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    AdminRepository,
    JwtService,
    PasswordService,
    RolesGuard,
    AdminAuthGuard
  ],
  exports: [
    AdminAuthService
  ]
})
export class AdminAuthModule {}