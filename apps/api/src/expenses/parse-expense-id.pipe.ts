import { NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { ExpenseMessages } from './expense.messages.js';

/** A malformed id can never match an expense, so it is reported as not found. */
export const ParseExpenseIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new NotFoundException(ExpenseMessages.NOT_FOUND),
});
