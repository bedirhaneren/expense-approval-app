import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ApiErrors } from '../docs/api-errors.decorator.js';
import { ExpenseAction, Role } from '../generated/prisma/client.js';
import { ExpenseFormDto } from './dto/expense-form.dto.js';
import { ExpenseWorkflowService } from './expense-workflow.service.js';
import type { ExpenseDetail, ExpenseSummary } from './expense.types.js';
import { ExpensesService } from './expenses.service.js';
import { ParseExpenseIdPipe } from './parse-expense-id.pipe.js';

@ApiTags('Expenses')
@ApiBearerAuth()
@ApiErrors(401)
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expenses: ExpensesService,
    private readonly workflow: ExpenseWorkflowService,
  ) {}

  @ApiOperation({
    summary: 'Çalışanın kendi masraflarını listeler (yeniden eskiye)',
  })
  @ApiErrors(403)
  @Roles(Role.EMPLOYEE)
  @Get()
  listMine(@CurrentUser() user: AuthUser): Promise<ExpenseSummary[]> {
    return this.expenses.listVisible(user);
  }

  /** Open to all roles; each role only sees expenses within its own scope. */
  @ApiOperation({
    summary: 'Masraf detayını ve işlem geçmişini döner',
    description:
      'Tüm roller kullanabilir; her rol sadece kendi kapsamındaki masrafları görür.',
  })
  @ApiErrors(404)
  @Get(':id')
  getById(
    @Param('id', ParseExpenseIdPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ExpenseDetail> {
    return this.expenses.getVisibleById(id, user);
  }

  @ApiOperation({ summary: 'Taslak masraf oluşturur' })
  @ApiErrors(400, 403)
  @Roles(Role.EMPLOYEE)
  @Post()
  create(
    @Body() form: ExpenseFormDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ExpenseDetail> {
    return this.workflow.create(form, user);
  }

  @ApiOperation({
    summary: 'Taslağı günceller (tüm form alanları gönderilir)',
    description: 'Sadece masraf sahibi ve sadece taslak durumunda.',
  })
  @ApiErrors(400, 403, 404, 409)
  @Roles(Role.EMPLOYEE)
  @Put(':id')
  updateDraft(
    @Param('id', ParseExpenseIdPipe) id: string,
    @Body() form: ExpenseFormDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ExpenseDetail> {
    return this.workflow.updateDraft(id, form, user);
  }

  @ApiOperation({ summary: 'Taslağı yönetici onayına gönderir' })
  @ApiErrors(403, 404, 409)
  @Roles(Role.EMPLOYEE)
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  submit(
    @Param('id', ParseExpenseIdPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ExpenseDetail> {
    return this.workflow.transition({
      expenseId: id,
      action: ExpenseAction.SUBMITTED,
      actor: user,
    });
  }
}
