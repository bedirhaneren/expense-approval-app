import 'server-only';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

const UNREACHABLE_MESSAGE =
  'Sunucuya şu anda ulaşılamıyor. Lütfen biraz sonra tekrar deneyin.';

/** An error response from the API, with its (Turkish) messages. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly messages: string[],
  ) {
    super(messages[0] ?? `API error ${status}`);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  token?: string;
}

/** Server-side call to the NestJS API. The browser never talks to the API directly. */
export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const response = await sendRequest(path, method, body, token);
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, extractMessages(payload));
  }
  return payload as T;
}

async function sendRequest(
  path: string,
  method: string,
  body: unknown,
  token?: string,
): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(503, [UNREACHABLE_MESSAGE]);
  }
}

/** NestJS returns `message` as a string or, for validation errors, a string array. */
function extractMessages(payload: unknown): string[] {
  const message = (payload as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.map(String);
  if (typeof message === 'string') return [message];
  return ['Beklenmeyen bir hata oluştu.'];
}
