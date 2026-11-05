import { registerDecorator, ValidationOptions } from 'class-validator';
import { todayAsDateOnly } from '../date-only.js';

/** Validates a YYYY-MM-DD string that is today or earlier in business time. */
export function IsNotFutureDate(options?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isNotFutureDate',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && value <= todayAsDateOnly(),
      },
    });
  };
}
