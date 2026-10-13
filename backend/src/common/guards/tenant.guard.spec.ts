import { describe, it, expect } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard.js';
import { Role } from '../enums/index.js';

describe('TenantGuard', () => {
  let guard: TenantGuard;

  const mockContext = (user: any, params = {}, query = {}, body = {}): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user, params, query, body }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    guard = new TenantGuard();
  });

  it('should allow SUPER_ADMIN for any restaurant', () => {
    const context = mockContext(
      { role: Role.SUPER_ADMIN, restaurantAssignments: [] },
      { restaurantId: 'rest-123' },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow user if restaurantId is in their restaurantAssignments', () => {
    const context = mockContext(
      { role: Role.RESTAURANT_MANAGER, restaurantAssignments: ['rest-123', 'rest-456'] },
      { restaurantId: 'rest-123' },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user attempts cross-tenant access', () => {
    const context = mockContext(
      { role: Role.RESTAURANT_MANAGER, restaurantAssignments: ['rest-123'] },
      { restaurantId: 'rest-999' },
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should pass through if no restaurantId is present in request', () => {
    const context = mockContext({ role: Role.RESTAURANT_OWNER, restaurantAssignments: [] });
    expect(guard.canActivate(context)).toBe(true);
  });
});
