import { describe, it, expect, vi } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { Role } from '../enums/index.js';

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  const mockContext = (user?: any): ExecutionContext =>
    ({
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = mockContext({ role: Role.CUSTOMER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access to SUPER_ADMIN regardless of required roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.RESTAURANT_OWNER]);
    const context = mockContext({ role: Role.SUPER_ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user role matches one of required roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      Role.RESTAURANT_OWNER,
      Role.RESTAURANT_MANAGER,
    ]);
    const context = mockContext({ role: Role.RESTAURANT_MANAGER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject access (ForbiddenException) when user does not have required role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.SUPER_ADMIN]);
    const context = mockContext({ role: Role.RESTAURANT_STAFF });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should reject unauthenticated request when roles are required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.RESTAURANT_OWNER]);
    const context = mockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
