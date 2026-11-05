import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/** Error body produced by NestJS for every failed request. */
export class ApiErrorResponse {
  statusCode: number;
  /** Türkçe hata mesajı; doğrulama hatalarında mesaj listesi */
  message: string | string[];
  error: string;
}

const ERROR_DESCRIPTIONS = {
  [HttpStatus.BAD_REQUEST]: 'İstek gövdesi geçersiz (doğrulama hataları)',
  [HttpStatus.UNAUTHORIZED]: 'Giriş yapılmamış veya oturum geçersiz',
  [HttpStatus.FORBIDDEN]: 'Kullanıcının rolü bu işleme izin vermiyor',
  [HttpStatus.NOT_FOUND]: 'Masraf yok veya kullanıcının kapsamı dışında',
  [HttpStatus.CONFLICT]: 'Masrafın mevcut durumu bu işleme uygun değil',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Aynı hesap için çok fazla giriş denemesi',
} as const;

type DocumentedError = keyof typeof ERROR_DESCRIPTIONS;

/** Documents the error responses an endpoint can return. */
export function ApiErrors(...statuses: DocumentedError[]) {
  return applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: ERROR_DESCRIPTIONS[status],
        type: ApiErrorResponse,
      }),
    ),
  );
}
