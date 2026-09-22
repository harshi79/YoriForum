import { getEnv } from '@/lib/db';

export const runtime = 'nodejs';

// Step 1: redirect the user to GitHub's OAuth consent screen.
export async function GET(req) {
  const env = await getEnv();
  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return Response.json(
      { error: 'GitHub OAuth not configured. Set GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET (see README).' },
      { status: 500 }
    );
  }
  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/auth/callback`;
  const state = crypto.randomUUID();
  const proto = new URL(req.url).protocol;
  const secure = proto === 'https:' ? '; Secure' : '';

  const url =
    'https://github.com/login/oauth/authorize' +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent('read:user')}` +
    `&state=${state}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      'Set-Cookie': `yori_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`,
    },
  });
}
