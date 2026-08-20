export type Principal = {
  id: string;
  display_name: string | null;
  locale: string;
};

type Session = {
  access_token: string;
  token_type: "bearer";
  expires_at: string;
  principal: Principal;
};

type Challenge = {
  challenge_id: string;
  expires_at: string;
  status: "accepted";
};

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_SPACEWHY_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) throw new Error(String(response.status));
  return response.json() as Promise<T>;
}

export function createPhoneChallenge(phone: string) {
  return request<Challenge>("/identity/auth/telegram/challenges", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyPhoneChallenge(challengeId: string, code: string) {
  return request<Session>(`/identity/auth/telegram/challenges/${challengeId}/verify`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function getCurrentPrincipal(accessToken: string) {
  return request<Principal>("/identity/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
