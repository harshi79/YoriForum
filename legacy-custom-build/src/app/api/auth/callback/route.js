import { db, getEnv, qFirst, qRun, now } from '@/lib/db';
import { parseCookies, createSession, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

// Step 2: GitHub redirects back here with ?code=... — exchange it,
// fetch the profile, upsert the user, create a session, go home.
export async function GET(req) {
  const database = await db();
  if (!database) return Response.json({ error: 'Database unavailable' }, { status: 503 });
  const env = await getEnv();
  const url = new URL(req.url);
  const origin = url.origin;

  const fail = (msg) =>
    new Response(null, { status: 302, headers: { Location: `${origin}/login?error=${encodeURIComponent(msg)}` } });

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = parseCookies(req);
  if (!code || !state || state !== cookies.yori_oauth_state) return fail('OAuth state mismatch — try again.');

  try {
    // Exchange code -> access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/api/auth/callback`,
      }),
    });
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) return fail('GitHub did not return an access token.');

    // Fetch profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'YoriForum' },
    });
    if (!userRes.ok) return fail('Could not fetch GitHub profile.');
    const gh = await userRes.json();
    if (!gh.id || !gh.login) return fail('Invalid GitHub profile response.');

    // Upsert user. First human user becomes admin (after yoribot).
    const t = now();
    let user = await qFirst(database, 'SELECT * FROM users WHERE github_id = ?', [String(gh.id)]);
    if (!user) {
      const humans = await qFirst(database, `SELECT COUNT(*) AS n FROM users WHERE github_id != 'system'`);
      const isFirst = humans && humans.n === 0;
      const envAdmin = (env.ADMIN_GITHUB_USERNAME || '').toLowerCase();
      const isAdmin = isFirst || (envAdmin && gh.login.toLowerCase() === envAdmin) ? 1 : 0;
      const r = await qRun(
        database,
        'INSERT INTO users (github_id, username, avatar_url, bio, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [String(gh.id), gh.login, gh.avatar_url || '', gh.bio || '', isAdmin, t]
      );
      user = await qFirst(database, 'SELECT * FROM users WHERE id = ?', [r.id]);
    } else {
      // Keep avatar/username fresh on every login (free profile sync!)
      await qRun(database, 'UPDATE users SET username = ?, avatar_url = ? WHERE id = ?', [
        gh.login,
        gh.avatar_url || user.avatar_url,
        user.id,
      ]);
      user.username = gh.login;
      user.avatar_url = gh.avatar_url || user.avatar_url;
    }
    if (!user) return fail('Could not create user record.');

    const session = await createSession(database, user.id);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/`,
        'Set-Cookie': [
          setSessionCookie(req, session),
          `yori_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        ].join(', '),
      },
    });
  } catch (e) {
    return fail(`Login failed: ${e?.message || 'unknown error'}`);
  }
}
