import 'server-only';
import { requireSessionToken } from '../dal';
import { ApiError, apiRequest } from './client';

export interface ActionResult {
  error?: string;
}

/** Server Actions can be called with any arguments, so ids are encoded before use in a URL. */
export const encodeId = (id: string) => encodeURIComponent(id);

/**
 * Sends a POST command with the user's token and turns an API error into a
 * message for the UI. The API decides whether the user may do it.
 */
export async function sendCommand(
  path: string,
  body?: object,
): Promise<ActionResult> {
  const token = await requireSessionToken();
  try {
    await apiRequest(path, { method: 'POST', body, token });
    return {};
  } catch (error) {
    if (error instanceof ApiError) return { error: error.messages[0] };
    throw error;
  }
}
