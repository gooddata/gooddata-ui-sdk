// (C) 2026 GoodData Corporation

import { type Plugin, type ViteDevServer } from "vite";

const APP_LOGIN_PATH = "/appLogin";

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>appLogin — dev harness</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; padding: 48px 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.55; color: #464e56; background: #fff;
  }
  @media (prefers-color-scheme: dark) { body { color: #d5d9dd; background: #1c2124; } }
  main { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .tag { display: inline-block; font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
         color: #94a1ad; margin-bottom: 16px; }
  p { margin: 0 0 12px; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px;
         background: rgba(148, 161, 173, .18); padding: 1px 5px; border-radius: 3px; }
  a { color: #14b2e2; }
</style>
</head>
<body>
<main>
  <div class="tag">Local dev harness</div>
  <h1>appLogin — invalid or missing token</h1>
  <p>
    The backend answered <strong>401</strong> and the app redirected to <code>/appLogin</code>. That endpoint
    only exists on a deployed backend (it starts the OIDC login); the harness dev server serves this page
    instead, so you don't end up in an endless
    <code>/appLogin?redirectTo=/appLogin?redirectTo=…</code> loop.
  </p>
  <p>
    Set a valid <code>TIGER_API_TOKEN</code> for your <code>BACKEND_URL</code> in the harness
    <code>.env</code> and restart the dev server — <code>.env</code> is read once at startup.
  </p>
  <p><a href="/">Back to the app</a></p>
</main>
</body>
</html>
`;

/**
 * Dev-only Vite plugin that serves a static placeholder page on `/appLogin`.
 *
 * On a 401 the SDK's authentication flow redirects to `/appLogin?redirectTo=…`, an endpoint only a real
 * backend serves. Locally the dev server would answer it with the harness index.html, which boots the app
 * again, gets another 401 and redirects again — an endless loop of ever-nesting `redirectTo` params. This
 * plugin intercepts the path and shows a short "invalid or missing token" note instead.
 *
 * No-op in production (`apply: "serve"`).
 */
export function devAppLoginPlugin(): Plugin {
    return {
        name: "gooddata-dev-app-login",
        apply: "serve",
        configureServer(server: ViteDevServer) {
            // Registered from configureServer's body, so it runs before Vite's SPA html fallback
            // would hand /appLogin the harness index.html (which re-boots the app and re-redirects).
            server.middlewares.use((req, res, next) => {
                const url = req.url ?? "";
                const queryStart = url.indexOf("?");
                const pathname = queryStart === -1 ? url : url.slice(0, queryStart);

                if (pathname !== APP_LOGIN_PATH && pathname !== `${APP_LOGIN_PATH}/`) {
                    next();
                    return;
                }

                res.statusCode = 200;
                res.setHeader("content-type", "text/html; charset=utf-8");
                res.setHeader("cache-control", "no-store");
                res.end(PAGE);
            });
        },
    };
}
