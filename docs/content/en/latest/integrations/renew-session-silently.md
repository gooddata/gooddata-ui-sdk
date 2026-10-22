---
title: Renew the session without a redirect
description: Build an authentication provider that renews an expired GoodData session in a hidden iframe, so users keep their place in the app instead of being sent to the login page.
category: Integrations
diataxis_type: howto
type: docs
weight: 13
section: Integrations
api_symbols:
  - "@gooddata/sdk-backend-tiger:ContextDeferredAuthProvider"
  - "@gooddata/sdk-backend-tiger:redirectToTigerAuthentication"
  - "@gooddata/sdk-backend-tiger:tigerFactory"
  - "@gooddata/sdk-backend-spi:NotAuthenticatedHandler"
  - "@gooddata/sdk-backend-spi:NotAuthenticated"
  - "@gooddata/sdk-backend-spi:isNotAuthenticated"
  - "@gooddata/sdk-backend-spi:IAuthenticationContext"
  - "@gooddata/sdk-backend-spi:IAuthenticatedPrincipal"
related_pages:
  - /docs/integrations/authentication
  - /docs/integrations/cross-origin-issues
  - /docs/integrations/backend-setup
source_files:
  - src/auth.ts
ai_generated_description: true
ai_generated_body: true
---

When the GoodData session expires, the usual [session cookie setup](../authentication/#session-cookie-context-deferred)
redirects the whole window to the login page, and the user loses what they were doing: open dialogs, filters,
unsaved edits. Replace that redirect with a renewal in a hidden iframe. If the user still
has a session at your identity provider, GoodData issues a new cookie in the background and the failed request
goes through.

Here's how the renewal works:

1. A request returns 401, and the SDK calls your provider's `authenticate()`.
2. The provider first loads the user with the current cookie. If that works, nothing else happens.
3. Otherwise it opens a hidden iframe on `<GoodData host>/appLogin?redirectTo=<your callback page>`.
4. GoodData and the identity provider sign the user in without a prompt, set a new cookie, and redirect the
   iframe to your callback page.
5. The callback page tells the parent window it's done. The provider removes the iframe and loads the user
   again, and the SDK retries the request.
6. If the renewal fails or takes too long, the SDK calls your `NotAuthenticated` handler, as it does today.

Before you start, make sure you have:

- An app that signs users in to GoodData through single sign-on (OIDC) with `ContextDeferredAuthProvider`.
- Your app on the same site as GoodData, or the GoodData API proxied through your app's domain. The renewal
  sets a cookie inside the iframe, and a third-party cookie is blocked there too. See
  [Cookies across sites](../authentication/#cookies-across-sites).
- An identity provider that signs a known user in without a prompt and lets its sign-in page load in an
  iframe. Many block framing by default; check its `X-Frame-Options` and `Content-Security-Policy` settings.

## Add the callback page

The iframe ends on this page. Make it a static file next to your app, for example `public/auth-callback.html`
in a Vite project, so the iframe doesn't load the whole app:

```html
<!doctype html>
<script>
    // Only a parent window on the same origin receives the message.
    window.parent.postMessage("gooddata-auth-finished", window.location.origin);
</script>
```

The file must be served from the same origin as your app; the provider ignores messages from anywhere else.

## Create the provider

Now extend `ContextDeferredAuthProvider` and override `authenticate()`:

```ts
import {
    type IAuthenticatedPrincipal,
    type IAuthenticationContext,
    isNotAuthenticated,
    type NotAuthenticatedHandler,
} from "@gooddata/sdk-backend-spi";
import { ContextDeferredAuthProvider } from "@gooddata/sdk-backend-tiger";

const AUTH_FINISHED = "gooddata-auth-finished";

export class SilentRenewalAuthProvider extends ContextDeferredAuthProvider {
    // withAuthentication() remembers the first signed-in user and would never call authenticate() again.
    public override disablePrincipalCache = true;

    private renewal: Promise<void> | undefined;

    constructor(
        private readonly gooddataHost: string, // "https://example.gooddata.com"
        private readonly callbackUrl: string, // "https://app.example.com/auth-callback.html"
        onNotAuthenticated: NotAuthenticatedHandler,
        private readonly timeoutMs = 15_000,
    ) {
        super(onNotAuthenticated);
    }

    public override async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        try {
            // The cookie may still be valid, for example on the first call.
            return await super.authenticate(context);
        } catch (error) {
            if (!isNotAuthenticated(error)) {
                throw error;
            }
        }

        // One renewal at a time, however many requests failed.
        this.renewal ??= this.renewInIframe().finally(() => {
            this.renewal = undefined;
        });
        await this.renewal;

        // Throws NotAuthenticated if the renewal didn't help; the SDK then calls onNotAuthenticated.
        return super.authenticate(context);
    }

    private renewInIframe(): Promise<void> {
        return new Promise((resolve) => {
            const loginUrl = new URL("/appLogin", this.gooddataHost);
            loginUrl.searchParams.set("redirectTo", this.callbackUrl);

            const iframe = document.createElement("iframe");
            iframe.hidden = true;
            iframe.src = loginUrl.href;

            const finish = () => {
                window.clearTimeout(timer);
                window.removeEventListener("message", onMessage);
                iframe.remove();
                resolve();
            };
            const onMessage = (event: MessageEvent) => {
                if (event.origin === window.location.origin && event.data === AUTH_FINISHED) {
                    finish();
                }
            };
            // A stuck or prompting identity provider never reaches the callback page.
            const timer = window.setTimeout(finish, this.timeoutMs);

            window.addEventListener("message", onMessage);
            document.body.appendChild(iframe);
        });
    }
}
```

The promise always resolves, also on timeout. The next `super.authenticate()` decides whether the renewal
worked, so a failed renewal ends in your handler instead of a request that never returns.

## Connect the provider to the backend

Pass the provider to the backend, with a handler for the case the renewal can't fix, for example a user whose
identity provider session has ended too:

```ts
import { redirectToTigerAuthentication, tigerFactory } from "@gooddata/sdk-backend-tiger";
import debounce from "lodash/debounce";

const authProvider = new SilentRenewalAuthProvider(
    "https://example.gooddata.com",
    `${window.location.origin}/auth-callback.html`,
    // Last resort: the full sign-in. Debounced, because every failed request calls it.
    debounce(redirectToTigerAuthentication, 500),
);

const backend = tigerFactory().onHostname("https://example.gooddata.com").withAuthentication(authProvider);
```

Instead of the redirect, you can show a "Your session expired" message and let the user choose when to sign
in. See [Write your own handler](../authentication/#write-your-own-handler).

## Test the renewal

1. Sign in and open a page with GoodData components.
2. Delete the GoodData session cookies for the GoodData host in your browser's developer tools.
3. Change a filter or open another dashboard.

In the Network tab you see a 401, a request to `/appLogin` from an iframe, the callback page, and the retried
request with a 200. The page doesn't reload.

If the retried request still fails, look at the iframe's requests: a blocked frame (`X-Frame-Options`,
`frame-ancestors`), a blocked cookie, or a sign-in form from the identity provider means one of the
requirements at the top of this page isn't met.

## Retry your own API calls

If your app also calls the GoodData API with `fetch`, those requests don't go through the SDK's retry. Wrap them the same way: on 401, call
`backend.authenticate(true)` once and repeat the request.

```ts
async function gooddataFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const send = () =>
        fetch(new URL(path, "https://example.gooddata.com"), {
            ...init,
            credentials: "include",
            // Without it, GoodData answers an expired session with a login page instead of 401.
            headers: { "X-Requested-With": "XMLHttpRequest", ...init.headers },
        });

    const response = await send();
    if (response.status !== 401) {
        return response;
    }
    await backend.authenticate(true); // runs the renewal; throws if the user must sign in
    return send();
}
```
