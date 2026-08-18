const DEFAULT_RETURN_PATH = '/client/index.html/device';
const SESSION_COOKIE = 'fd06_demo_access';

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const safeReturnPath = (value) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_RETURN_PATH;
  }
  return value;
};

const sessionToken = async (password) => {
  const input = new TextEncoder().encode(`fd06-demo-access:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
};

const readCookie = (request, name) => {
  const cookieHeader = request.headers.get('cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const [key, ...valueParts] = part.trim().split('=');
    if (key === name) return valueParts.join('=');
  }
  return null;
};

const passwordPage = (returnPath, hasError = false) => {
  const action = `/_access?returnTo=${encodeURIComponent(returnPath)}`;
  const errorMessage = hasError
    ? '<p class="error" role="alert">密码不正确，请重新输入</p>'
    : '<p class="hint">请输入访问密码以查看智能调奶器 Demo</p>';

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>访问验证 · 智能调奶器</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        color: #221122;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f7f4ef;
      }
      main {
        width: min(100%, 360px);
        padding: 32px;
        border: 1px solid rgba(139, 74, 27, 0.12);
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 16px 48px rgba(64, 43, 31, 0.09);
      }
      .mark {
        display: grid;
        width: 40px;
        height: 40px;
        place-items: center;
        margin-bottom: 24px;
        border-radius: 8px;
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        background: #8b4a1b;
      }
      h1 { margin: 0; font-size: 24px; line-height: 1.25; }
      .hint, .error { min-height: 20px; margin: 10px 0 22px; font-size: 14px; }
      .hint { color: #77706d; }
      .error { color: #b42318; }
      label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
      input {
        width: 100%;
        height: 46px;
        padding: 0 14px;
        border: 1px solid #ded9d5;
        border-radius: 8px;
        color: #221122;
        font: inherit;
        outline: none;
      }
      input:focus { border-color: #8b4a1b; box-shadow: 0 0 0 3px rgba(139, 74, 27, 0.10); }
      button {
        width: 100%;
        height: 46px;
        margin-top: 14px;
        border: 0;
        border-radius: 8px;
        color: #fff;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        background: #8b4a1b;
      }
      button:hover { background: #743b15; }
    </style>
  </head>
  <body>
    <main>
      <div class="mark">FD06</div>
      <h1>智能调奶器 Demo</h1>
      ${errorMessage}
      <form method="post" action="${escapeHtml(action)}">
        <label for="password">访问密码</label>
        <input id="password" name="password" type="password" autocomplete="current-password" autofocus required />
        <button type="submit">进入 Demo</button>
      </form>
    </main>
  </body>
</html>`;
};

const htmlResponse = (html, status = 401) =>
  new Response(html, {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'text/html; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  });

const worker = {
  async fetch(request, env) {
    const password = env.SITE_ACCESS_PASSWORD;
    if (!password) {
      return new Response('Site access is not configured.', { status: 503 });
    }

    const url = new URL(request.url);
    const expectedToken = await sessionToken(password);
    const isAuthorized = readCookie(request, SESSION_COOKIE) === expectedToken;

    if (url.pathname === '/_access' && request.method === 'POST') {
      const formData = await request.formData();
      const returnPath = safeReturnPath(url.searchParams.get('returnTo'));

      if (formData.get('password') !== password) {
        return htmlResponse(passwordPage(returnPath, true));
      }

      return new Response(null, {
        status: 303,
        headers: {
          location: returnPath,
          'set-cookie': `${SESSION_COOKIE}=${expectedToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        },
      });
    }

    if (!isAuthorized) {
      const returnPath = safeReturnPath(`${url.pathname}${url.search}`);
      return htmlResponse(passwordPage(returnPath));
    }

    if (url.pathname === '/') {
      return Response.redirect(new URL(DEFAULT_RETURN_PATH, url), 302);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404 || request.method !== 'GET') {
      return assetResponse;
    }

    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (!acceptsHtml) return assetResponse;

    const indexUrl = new URL('/index.html', url);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};

export default worker;
