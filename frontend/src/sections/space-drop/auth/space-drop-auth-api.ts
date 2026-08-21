export type PanelPrincipal = {
  id: string;
  display_name: string | null;
  locale: string;
};

export type PanelSession = {
  access_token: string;
  token_type: 'bearer';
  expires_at: string;
  principal: PanelPrincipal;
};

export type PhoneChallenge = {
  challenge_id: string;
  expires_at: string;
  telegram_start_parameter: string;
  status: 'accepted';
};

export type SessionHandoff = {
  handoff_token: string;
  expires_at: string;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_SPACE_DROP_API_URL || 'http://localhost:8000/api/v1'
).replace(/\/$/, '');

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as { code?: string } | null;
    throw new Error(problem?.code || `space_drop_auth_${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function requestPhoneChallenge(phone: string): Promise<PhoneChallenge> {
  return request('/identity/auth/telegram/challenges', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function buildAuthBotDeepLink(botUrl: string, startParameter: string): string {
  if (!/^login_[0-9a-f]{32}$/.test(startParameter)) {
    throw new Error('space_drop_auth_invalid_start_parameter');
  }
  const url = new URL(botUrl);
  url.searchParams.set('start', startParameter);
  return url.toString();
}

export function verifyPhoneChallenge(challengeId: string, code: string): Promise<PanelSession> {
  return request(`/identity/auth/telegram/challenges/${challengeId}/verify`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function getPanelPrincipal(accessToken: string): Promise<PanelPrincipal> {
  return request('/identity/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function createFinanceHandoff(accessToken: string): Promise<SessionHandoff> {
  return request('/identity/session-handoffs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ target: 'finance' }),
  });
}
