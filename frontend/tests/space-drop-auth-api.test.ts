import assert from 'node:assert/strict';
import test from 'node:test';

import { createFinanceHandoff, requestPhoneChallenge } from 'src/sections/space-drop/auth/space-drop-auth-api';

const jsonResponse = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

test('phone authentication requests one Telegram-delivered challenge', async () => {
  const originalFetch = globalThis.fetch;
  let body = '';
  globalThis.fetch = async (_input, init) => {
    body = String(init?.body);
    return jsonResponse({
      challenge_id: 'challenge',
      expires_at: '2026-08-20T12:00:00Z',
      status: 'accepted',
    }, 202);
  };

  try {
    await requestPhoneChallenge('+998901234567');
    assert.deepEqual(JSON.parse(body), { phone: '+998901234567' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Finance launch creates a target-bound handoff with the panel bearer', async () => {
  const originalFetch = globalThis.fetch;
  let url = '';
  let headers: HeadersInit | undefined;
  globalThis.fetch = async (input, init) => {
    url = String(input);
    headers = init?.headers;
    return jsonResponse({ handoff_token: 'opaque-handoff', expires_at: '2026-08-20T12:00:00Z' }, 201);
  };

  try {
    await createFinanceHandoff('panel-session');
    assert.equal(url.endsWith('/identity/session-handoffs'), true);
    assert.deepEqual(headers, {
      'Content-Type': 'application/json',
      Authorization: 'Bearer panel-session',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
