import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../enums/index.js';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Super Admin has global tenant access
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    const restaurantId =
      request.params?.restaurantId ||
      request.query?.restaurantId ||
      request.body?.restaurantId;

    // If endpoint is not tenant-specific, allow pass-through
    if (!restaurantId) {
      return true;
    }

    const assignedIds: string[] = (user.restaurantAssignments || []).map((id: any) =>
      id.toString(),
    );

    const isAssigned = assignedIds.includes(restaurantId.toString());

    if (!isAssigned && user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        `Cross-tenant access forbidden. You do not have permissions for restaurant: ${restaurantId}`,
      );
    }

    return true;
  }
}
