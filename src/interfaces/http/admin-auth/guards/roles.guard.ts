import { 
  CanActivate, 
  ForbiddenException, 
  Injectable, 
  type ExecutionContext
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Trace } from "src/common/decorators/trace.decorator";
import { LoggerService } from "src/common/logger/logger.service";
import { AdminRole } from "src/domain/auth/admin-role.enum";
import { ROLES_KEY } from "../decorators/roles.decorators";
import { Request } from "express";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService
  ) {}

  @Trace("auth.rolesGuard")
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass()
      ]
    );

    if(!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>();

    let admin = request['admin'];

    if(!admin) {
      this.logger.warn("RolesGuard access denied", {
        adminId: admin.sub,
        role: admin.role
      });

      throw new ForbiddenException("Access denied");
    }

    const hasRole = requiredRoles.includes(admin.role);

    if(!hasRole) {
      this.logger.warn("RolesGuard access denied", {
        adminId: admin.sub,
        role: admin.role,
        requiredRoles
      });

      throw new ForbiddenException("Insufficient permissions");
    }

    this.logger.debug("RolesGuard access granted", {
      adminId: admin.sub,
      role: admin.role
    });

    return true;
  }
}