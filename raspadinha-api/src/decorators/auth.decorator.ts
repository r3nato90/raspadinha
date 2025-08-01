import { applyDecorators, UseGuards } from '@nestjs/common';

import { AdminGuard } from 'src/auth/guards/admin.guard';

import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';

export function Auth(requireAdmin = false) {
  const decorators = [UseGuards(JwtAuthGuard)];
  
  if (requireAdmin) {
    decorators.push(UseGuards(AdminGuard));
  }
  
  return applyDecorators(...decorators);
}