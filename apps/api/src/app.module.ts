import { Module } from '@nestjs/common';
import { ApprovalsModule } from './approvals/approvals.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ExpensesModule } from './expenses/expenses.module.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    ExpensesModule,
    ApprovalsModule,
  ],
})
export class AppModule {}
