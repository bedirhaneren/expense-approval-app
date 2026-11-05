import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator.js';

export class RejectExpenseDto {
  @Trim()
  @IsString({ message: 'Red gerekçesi metin olmalıdır.' })
  @IsNotEmpty({ message: 'Red gerekçesi zorunludur.' })
  @MaxLength(500, { message: 'Red gerekçesi en fazla 500 karakter olabilir.' })
  reason: string;
}
