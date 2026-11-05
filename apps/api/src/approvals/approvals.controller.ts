import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type {
  ExpenseDetail,
  ExpenseSummary,
} from '../expenses/expense.types.js';
import { ApiErrors } from '../docs/api-errors.decorator.js';
import { ParseExpenseIdPipe } from '../expenses/parse-expense-id.pipe.js';
import { Role } from '../generated/prisma/client.js';
import { ApprovalsService } from './approvals.service.js';
import { RejectExpenseDto } from './dto/reject-expense.dto.js';
import { ParseReviewStagePipe, ReviewStage } from './review-stage.js';

/**
 * Serves /approvals/manager and /approvals/accounting. The guard admits both
 * reviewer roles; the service then checks that the role matches the stage.
 */
@ApiTags('Approvals')
@ApiBearerAuth()
@ApiParam({
  name: 'stage',
  enum: ReviewStage,
  description: 'manager: yönetici (ahmet), accounting: muhasebe (ayse)',
})
@ApiErrors(401, 403)
@Roles(Role.MANAGER, Role.ACCOUNTING)
@Controller('approvals/:stage')
export class ApprovalsController {
  constructor(private readonly approvals: ApprovalsService) {}

  @ApiOperation({ summary: 'Bu aşamada onay bekleyen masrafları listeler' })
  @Get()
  listPending(
    @Param('stage', ParseReviewStagePipe) stage: ReviewStage,
    @CurrentUser() reviewer: AuthUser,
  ): Promise<ExpenseSummary[]> {
    return this.approvals.listPending(stage, reviewer);
  }

  @ApiOperation({
    summary: 'Masrafı onaylar',
    description:
      'Yönetici: Muhasebe Onayı Bekliyor durumuna geçirir. Muhasebe: Onaylandı (son durum).',
  })
  @ApiErrors(404, 409)
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('stage', ParseReviewStagePipe) stage: ReviewStage,
    @Param('id', ParseExpenseIdPipe) id: string,
    @CurrentUser() reviewer: AuthUser,
  ): Promise<ExpenseDetail> {
    return this.approvals.approve(stage, id, reviewer);
  }

  @ApiOperation({
    summary: 'Masrafı gerekçeyle reddeder (Reddedildi, son durum)',
  })
  @ApiErrors(400, 404, 409)
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('stage', ParseReviewStagePipe) stage: ReviewStage,
    @Param('id', ParseExpenseIdPipe) id: string,
    @Body() { reason }: RejectExpenseDto,
    @CurrentUser() reviewer: AuthUser,
  ): Promise<ExpenseDetail> {
    return this.approvals.reject(stage, id, reviewer, reason);
  }
}
