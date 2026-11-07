export const AUTH_COOKIE_NAME = 'accessToken';

/**
 * Sets the auth token in both localStorage and document.cookie
 * so that both client-side API requests and Next.js server components/middleware
 * have access to the JWT token.
 */
export function setClientAuthToken(token: string) {
  if (typeof window === 'undefined') return;

  try {
    const existing = localStorage.getItem('token');
    if (existing === token) return; // Already set, avoid redundant events and cookie rewrites

    localStorage.setItem('token', token);
    
    // Set cookie with 7-day max-age, Lax SameSite for navigation
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
}

/**
 * Clears the auth token from both localStorage and document.cookie
 */
export function clearClientAuthToken() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('token');
    
    // Clear cookies by setting expired max-age
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `token=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `better-auth.session_token=; path=/; max-age=0; SameSite=Lax`;
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}

/**
 * Gets the token from localStorage or document.cookie
 */
export function getClientAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;

    const match = document.cookie.match(new RegExp('(^|;\\s*)' + AUTH_COOKIE_NAME + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch {
    return null;
  }
}
