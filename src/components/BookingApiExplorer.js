import {useEffect, useMemo, useState} from 'react';

import {
  BOOKING_ACCOMMODATION_APIS,
  BOOKING_ENVIRONMENTS,
  buildCurl,
  materializeRequestBody,
} from '../data/bookingAccommodationApis';
import styles from './BookingApiExplorer.module.css';

function exampleBody(api) {
  if (api.sampleBody === null) {
    return '';
  }
  return JSON.stringify(api.sampleBody, null, 2);
}

function prettyResponse(text) {
  if (!text) {
    return '';
  }

  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export default function BookingApiExplorer() {
  const [selectedId, setSelectedId] = useState('search');
  const [transport, setTransport] = useState('proxy');
  const [environment, setEnvironment] = useState('sandbox');
  const [proxyBaseUrl, setProxyBaseUrl] = useState(
    'http://localhost:8787/booking-demand',
  );
  const [affiliateId, setAffiliateId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [directAcknowledged, setDirectAcknowledged] = useState(false);
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  const selectedApi = useMemo(
    () =>
      BOOKING_ACCOMMODATION_APIS.find((api) => api.id === selectedId) ??
      BOOKING_ACCOMMODATION_APIS[0],
    [selectedId],
  );

  useEffect(() => {
    setRequestBody(materializeRequestBody(selectedApi));
    setResponse(null);
    setMessage('');
  }, [selectedApi]);

  const selectedBaseUrl = BOOKING_ENVIRONMENTS[environment];
  const curl = buildCurl({
    api: selectedApi,
    baseUrl: selectedBaseUrl,
    affiliateId: '<AFFILIATE_ID>',
    requestBody,
  });

  function chooseApi(apiId) {
    setSelectedId(apiId);
    globalThis.document
      ?.getElementById('booking-api-console')
      ?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  async function copyCurl() {
    try {
      await navigator.clipboard.writeText(curl);
      setMessage('cURL copied with credential placeholders.');
    } catch {
      setMessage('Clipboard access was unavailable. Select and copy the cURL.');
    }
  }

  async function runRequest() {
    setMessage('');
    setResponse(null);

    let parsedBody;
    if (requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (error) {
        setMessage(
          `Request body is not valid JSON: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        return;
      }
    }

    if (transport === 'proxy' && !proxyBaseUrl.trim()) {
      setMessage('Enter the base URL of the Booking.com BFF or local proxy.');
      return;
    }

    if (
      transport === 'direct' &&
      (!affiliateId.trim() || !apiToken.trim() || !directAcknowledged)
    ) {
      setMessage(
        'Direct mode requires an affiliate ID, API token, and security acknowledgement.',
      );
      return;
    }

    if (transport === 'direct' && environment === 'production') {
      setMessage(
        'Direct browser mode is restricted to sandbox diagnostics. Use the BFF/proxy transport for production.',
      );
      return;
    }

    const baseUrl =
      transport === 'proxy'
        ? proxyBaseUrl.trim().replace(/\/$/, '')
        : selectedBaseUrl;
    const url = `${baseUrl}${selectedApi.path}`;
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (transport === 'direct') {
      headers.Authorization = `Bearer ${apiToken.trim()}`;
      headers['X-Affiliate-Id'] = affiliateId.trim();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const startedAt = performance.now();
    setRunning(true);

    try {
      const result = await fetch(url, {
        method: 'POST',
        headers,
        body: parsedBody === undefined ? undefined : JSON.stringify(parsedBody),
        signal: controller.signal,
      });
      const responseText = await result.text();

      setResponse({
        body: prettyResponse(responseText),
        elapsed: Math.round(performance.now() - startedAt),
        headers: Object.fromEntries(result.headers.entries()),
        ok: result.ok,
        status: result.status,
        statusText: result.statusText,
        url,
      });
    } catch (error) {
      const aborted = error?.name === 'AbortError';
      setResponse({
        body: aborted
          ? 'The request exceeded the 30-second timeout.'
          : `The browser could not complete the request.\n\n${
              error instanceof Error ? error.message : String(error)
            }\n\nIf direct mode was selected, Booking.com or the browser may have blocked the cross-origin request. Use the allow-listed BFF/proxy mode instead.`,
        elapsed: Math.round(performance.now() - startedAt),
        headers: {},
        ok: false,
        status: aborted ? 408 : 0,
        statusText: aborted ? 'Client timeout' : 'Network or CORS error',
        url,
      });
    } finally {
      clearTimeout(timeout);
      setRunning(false);
    }
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.catalog}>
        {BOOKING_ACCOMMODATION_APIS.map((api) => {
          const cardCurl = buildCurl({
            api,
            baseUrl: BOOKING_ENVIRONMENTS.sandbox,
            requestBody: exampleBody(api),
          });

          return (
            <article className={styles.apiCard} key={api.id}>
              <div className={styles.apiHeading}>
                <span className={styles.method}>POST</span>
                <code>{api.path}</code>
              </div>
              <h3>{api.title}</h3>
              <p>{api.description}</p>
              <details className={styles.curlDetails}>
                <summary>View sandbox cURL</summary>
                <pre>
                  <code>{cardCurl}</code>
                </pre>
              </details>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => chooseApi(api.id)}>
                Load in console
              </button>
            </article>
          );
        })}
      </div>

      <section
        className={styles.console}
        id="booking-api-console"
        aria-labelledby="booking-api-console-title">
        <div className={styles.consoleHeader}>
          <div>
            <p className={styles.eyebrow}>Interactive sandbox</p>
            <h2 id="booking-api-console-title">Demand API console</h2>
            <p>
              Requests and responses exist only in this browser session. Nothing
              is written to local storage.
            </p>
          </div>
          <span className={styles.environmentBadge}>{environment}</span>
        </div>

        <div className={styles.formGrid}>
          <label>
            API
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}>
              {BOOKING_ACCOMMODATION_APIS.map((api) => (
                <option value={api.id} key={api.id}>
                  {api.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Booking.com environment
            <select
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}>
              <option value="sandbox">Sandbox · recommended</option>
              <option value="production">Production · live data</option>
            </select>
          </label>
        </div>

        <fieldset className={styles.transport}>
          <legend>Connection mode</legend>
          <label>
            <input
              type="radio"
              name="booking-transport"
              value="proxy"
              checked={transport === 'proxy'}
              onChange={() => setTransport('proxy')}
            />
            <span>
              <strong>Server-side BFF / local proxy</strong>
              <small>Recommended. Credentials never enter the browser.</small>
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="booking-transport"
              value="direct"
              checked={transport === 'direct'}
              onChange={() => setTransport('direct')}
            />
            <span>
              <strong>Direct browser diagnostic</strong>
              <small>
                Sandbox exploration only. Subject to browser CORS policy.
              </small>
            </span>
          </label>
        </fieldset>

        {transport === 'proxy' ? (
          <label className={styles.fullWidth}>
            BFF or proxy base URL
            <input
              type="url"
              value={proxyBaseUrl}
              onChange={(event) => setProxyBaseUrl(event.target.value)}
              placeholder="https://your-bff.example.com/booking-demand"
            />
            <small>
              The proxy must expose the same allow-listed paths and attach the
              Booking.com credentials server-side.
            </small>
          </label>
        ) : (
          <div className={styles.directCredentials}>
            <div className={styles.warning}>
              Never use direct mode on a shared screen or production site. The
              token remains in React memory, but the browser sends it to
              Booking.com.
            </div>
            <div className={styles.formGrid}>
              <label>
                Affiliate ID
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={affiliateId}
                  onChange={(event) => setAffiliateId(event.target.value)}
                  placeholder="123456"
                />
              </label>
              <label>
                API key token
                <input
                  type="password"
                  autoComplete="off"
                  spellCheck="false"
                  value={apiToken}
                  onChange={(event) => setApiToken(event.target.value)}
                  placeholder="Bearer token"
                />
              </label>
            </div>
            <label className={styles.acknowledgement}>
              <input
                type="checkbox"
                checked={directAcknowledged}
                onChange={(event) =>
                  setDirectAcknowledged(event.target.checked)
                }
              />
              I understand that this browser will transmit the token and that
              CORS may block the request.
            </label>
          </div>
        )}

        <label className={styles.fullWidth}>
          JSON request body
          <textarea
            rows="18"
            value={requestBody}
            onChange={(event) => setRequestBody(event.target.value)}
            spellCheck="false"
          />
        </label>

        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={running}
            onClick={runRequest}>
            {running ? 'Sending…' : 'Send request'}
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => setRequestBody(materializeRequestBody(selectedApi))}>
            Reset sample
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={copyCurl}>
            Copy cURL
          </button>
          <button
            className={styles.tertiaryButton}
            type="button"
            onClick={() => {
              setApiToken('');
              setAffiliateId('');
              setResponse(null);
              setMessage('Sensitive fields and response cleared.');
            }}>
            Clear session values
          </button>
        </div>

        {message ? <p className={styles.message}>{message}</p> : null}

        <details className={styles.generatedCurl}>
          <summary>Generated cURL with safe placeholders</summary>
          <pre>
            <code>{curl}</code>
          </pre>
        </details>

        <section className={styles.response} aria-live="polite">
          <div className={styles.responseHeader}>
            <h3>Response</h3>
            {response ? (
              <div className={styles.responseMeta}>
                <span
                  className={
                    response.ok ? styles.statusSuccess : styles.statusError
                  }>
                  {response.status || 'Network'} {response.statusText}
                </span>
                <span>{response.elapsed} ms</span>
              </div>
            ) : (
              <span className={styles.responseEmpty}>Not invoked yet</span>
            )}
          </div>
          <pre>
            <code>
              {response?.body ||
                'Select an API, review the sample body, and send the request.'}
            </code>
          </pre>
          {response && Object.keys(response.headers).length > 0 ? (
            <details className={styles.responseHeaders}>
              <summary>Response headers</summary>
              <pre>
                <code>{JSON.stringify(response.headers, null, 2)}</code>
              </pre>
            </details>
          ) : null}
        </section>
      </section>
    </div>
  );
}
