export const ACCESS_TOKEN_TTL_SECONDS = 8 * 60 * 60;

export const AuthMessages = {
  INVALID_CREDENTIALS: 'Kullanıcı adı veya şifre hatalı.',
  LOGIN_REQUIRED: 'Bu işlem için giriş yapmanız gerekiyor.',
  SESSION_INVALID:
    'Oturumunuz geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.',
  FORBIDDEN_ROLE: 'Bu işlem için yetkiniz yok.',
} as const;
