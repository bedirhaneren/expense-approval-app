import { Module } from '@nestjs/common';
import { ExpenseWorkflowService } from './expense-workflow.service.js';
import { ExpensesController } from './expenses.controller.js';
import { ExpensesService } from './expenses.service.js';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpenseWorkflowService],
  exports: [ExpensesService, ExpenseWorkflowService],
})
export class ExpensesModule {}
