export async function apiRequest(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/')) window.dispatchEvent(new Event('apex:session-expired'));
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }
  return data;
}

export function notifyAccountChange() {
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('apex-account');
    channel.postMessage('changed');
    channel.close();
  }
}
