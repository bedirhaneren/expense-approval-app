import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
} from 'class-validator';
import { DATE_ONLY_PATTERN } from '../../common/date-only.js';
import { Trim } from '../../common/decorators/trim.decorator.js';
import { IsNotFutureDate } from '../../common/validators/is-not-future-date.validator.js';
import { ExpenseCategory } from '../../generated/prisma/client.js';

export const MAX_EXPENSE_AMOUNT = 1_000_000;

/** Used for both creating and editing a draft; editing replaces all fields. */
export class ExpenseFormDto {
  @Trim()
  @IsString({ message: 'Başlık metin olmalıdır.' })
  @IsNotEmpty({ message: 'Başlık zorunludur.' })
  @MaxLength(200, { message: 'Başlık en fazla 200 karakter olabilir.' })
  title: string;

  @Matches(DATE_ONLY_PATTERN, {
    message: 'Masraf tarihi YYYY-AA-GG biçiminde olmalıdır.',
  })
  @IsISO8601(
    { strict: true },
    { message: 'Masraf tarihi geçerli bir tarih olmalıdır.' },
  )
  @IsNotFutureDate({ message: 'Masraf tarihi gelecekte olamaz.' })
  expenseDate: string;

  @IsEnum(ExpenseCategory, {
    message: 'Kategori ulaşım, yemek, konaklama veya diğer olmalıdır.',
  })
  category: ExpenseCategory;

  @IsNumber(
    { maxDecimalPlaces: 2, allowNaN: false, allowInfinity: false },
    { message: 'Tutar en fazla 2 ondalık basamaklı bir sayı olmalıdır.' },
  )
  @IsPositive({ message: 'Tutar sıfırdan büyük olmalıdır.' })
  @Max(MAX_EXPENSE_AMOUNT, {
    message: `Tutar en fazla ${MAX_EXPENSE_AMOUNT.toLocaleString('tr-TR')} TL olabilir.`,
  })
  amount: number;

  @IsOptional()
  @Trim()
  @IsString({ message: 'Not metin olmalıdır.' })
  @MaxLength(1000, { message: 'Not en fazla 1000 karakter olabilir.' })
  note?: string | null;
}
