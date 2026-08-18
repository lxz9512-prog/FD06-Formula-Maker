const DEFAULT_RETURN_PATH = '/client/index.html#/device';

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return Response.redirect(new URL(DEFAULT_RETURN_PATH, url), 302);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404 || request.method !== 'GET') {
      return assetResponse;
    }

    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (!acceptsHtml) return assetResponse;

    const indexUrl = new URL('/app', url);
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};

export default worker;
