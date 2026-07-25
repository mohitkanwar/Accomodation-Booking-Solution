import http from 'node:http';

const allowedEndpoints = new Set([
  '/accommodations/search',
  '/accommodations/availability',
  '/accommodations/chains',
  '/accommodations/constants',
  '/accommodations/details',
  '/accommodations/details/changes',
  '/accommodations/reviews',
  '/accommodations/reviews/scores',
]);

const apiToken = process.env.BOOKING_API_TOKEN;
const affiliateId = process.env.BOOKING_AFFILIATE_ID;
const environment = process.env.BOOKING_API_ENV ?? 'sandbox';
const allowedOrigin =
  process.env.BOOKING_PROXY_ORIGIN ?? 'http://localhost:3000';
const port = Number(process.env.BOOKING_PROXY_PORT ?? 8787);
const apiVersion = '3.2';
const upstreamBase =
  environment === 'production'
    ? `https://demandapi.booking.com/${apiVersion}`
    : `https://demandapi-sandbox.booking.com/${apiVersion}`;

if (!apiToken || !affiliateId) {
  console.error(
    'BOOKING_API_TOKEN and BOOKING_AFFILIATE_ID are required. The proxy did not start.',
  );
  process.exit(1);
}

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  response.setHeader('Vary', 'Origin');
}

function sendJson(response, status, payload) {
  setCorsHeaders(response);
  response.writeHead(status, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) {
      throw new Error('Request body exceeds the 1 MB proxy limit.');
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

const server = http.createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (
    request.method === 'GET' &&
    request.url === '/booking-demand/health'
  ) {
    sendJson(response, 200, {
      status: 'ok',
      environment,
      api_version: apiVersion,
    });
    return;
  }

  const prefix = '/booking-demand';
  const endpoint = request.url?.startsWith(prefix)
    ? request.url.slice(prefix.length)
    : '';

  if (request.method !== 'POST' || !allowedEndpoints.has(endpoint)) {
    sendJson(response, 404, {
      error: 'Only allow-listed Booking.com accommodation endpoints are available.',
    });
    return;
  }

  const startedAt = Date.now();

  try {
    const body = await readBody(request);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const upstream = await fetch(`${upstreamBase}${endpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'X-Affiliate-Id': affiliateId,
      },
      body: body || undefined,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const responseBody = await upstream.text();
    response.writeHead(upstream.status, {
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/json',
      'Cache-Control': 'no-store',
    });
    response.end(responseBody);

    console.log(
      `${request.method} ${endpoint} -> ${upstream.status} (${Date.now() - startedAt} ms)`,
    );
  } catch (error) {
    const timeout = error?.name === 'AbortError';
    sendJson(response, timeout ? 504 : 502, {
      error: timeout
        ? 'Booking.com request timed out after 30 seconds.'
        : 'Booking.com request failed.',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(
    `Booking.com Demand API proxy listening at http://localhost:${port}/booking-demand`,
  );
  console.log(`Environment: ${environment}; allowed origin: ${allowedOrigin}`);
});
