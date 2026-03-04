import { eq } from "drizzle-orm";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../drizzle.service";
import { LoggerService } from "src/common/logger/logger.service";
import { Trace } from "src/common/decorators/trace.decorator";
import { withPerformanceLogging } from "src/common/performance/with-performance-logging";
import { RequestContextService } from "src/common/context/request-context.service";
import { admins } from "../schemas";

@Injectable()
export class AdminRepository {
  constructor(
    private readonly drizzleSerivce: DrizzleService,
    private readonly logger: LoggerService,
    private readonly context: RequestContextService
  ) {}

  @Trace("adminRepository.findByEmail")
  async findByEmail(email: string) {
    this.logger.debug("Finding admin by email", { email });

    const admin = await withPerformanceLogging(
      this.context,
      this.logger,
      "db.admin.findByEmail",
      async () => {
        return this.drizzleSerivce.db.query.admins.findFirst({
          where: eq(admins.email, email)
        });
      }
    );

    if(!admin) {
      this.logger.debug("Admin not found", { email });
      return null;
    }

    this.logger.debug("Admin found", {
      adminId: admin.id,
      role: admin.role
    });

    return admin;
  }
}