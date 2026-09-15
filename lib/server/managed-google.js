import { z } from 'zod';
import { HttpError } from './auth';

const Identity = z.object({
  id: z.union([z.string().min(1), z.number()]).transform(String),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  picture: z.string().nullable().optional(),
  session_token: z.string().min(1),
});

export function managedLoginUrl(callbackUrl) {
  if (!process.env.EMERGENT_AUTH_URL) throw new Error('Google sign-in configuration missing.');
  const url = new URL(process.env.EMERGENT_AUTH_URL);
  url.searchParams.set('redirect', callbackUrl);
  return url.toString();
}
export async function exchangeManagedSession(sessionId) {
  if (!process.env.EMERGENT_SESSION_DATA_URL) throw new Error('Google sign-in configuration missing.');
  let response;
  try {
    response = await fetch(process.env.EMERGENT_SESSION_DATA_URL, { headers: { 'X-Session-ID': sessionId, Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
  } catch { throw new HttpError(502, 'Google sign-in is temporarily unavailable. Please try again.'); }
  if (!response.ok) throw new HttpError(401, 'Google sign-in expired or was not completed. Please start again.');
  const result = Identity.safeParse(await response.json());
  if (!result.success) throw new HttpError(502, 'Google could not confirm your identity. Please try again.');
  // The server exchange is the identity assertion. Never trust browser-supplied identity,
  // and never return or persist the managed provider token in the browser.
  return { providerId: result.data.id, email: result.data.email.toLowerCase().trim(), name: result.data.name?.trim() || result.data.email.split('@')[0] };
}
