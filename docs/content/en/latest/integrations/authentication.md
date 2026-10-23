---
legacy_path: learn/integrate_and_authenticate/cn_and_cloud_authentication
title: Authenticate to the backend
description: Pick how your GoodData.UI application authenticates against GoodData Cloud or GoodData.CN — the GoodData session cookie, a JWT from your own portal, or an API token — and set it up.
category: Integrations
diataxis_type: howto
related_pages:
  - /docs/integrations/cross-origin-issues
  - /docs/integrations/renew-session-silently
  - /docs/integrations/backend-setup
  - /docs/integrations/web-components/web-components-auth
  - /docs/integrations/hooks/use-backend
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 12
section: Integrations
aliases:
  - "../learn/integrate_and_authenticate/cn_and_cloud_authentication/"
---

GoodData.UI doesn't sign anyone in. It sends every API request with whatever credential you give it: the
GoodData session cookie the browser already holds, or a bearer token in the `Authorization` header. You pick
which by passing an authentication provider to the backend:

```ts
import { tigerFactory } from "@gooddata/sdk-backend-tiger";

const backend = tigerFactory().onHostname("https://example.gooddata.com").withAuthentication(authProvider);
```

## Choose a method

| Your situation | Provider | Credential | Stability |
| --- | --- | --- | --- |
| Users sign in to GoodData (OIDC single sign-on) and your app runs on the same site as GoodData. | `ContextDeferredAuthProvider` | GoodData session cookie | Public |
| Your own portal already knows the user, and its server can issue a token for them. Also when your app runs on a different site than GoodData. | `TigerJwtAuthProvider` | JSON Web Token (JWT) signed by your server | Alpha |
| Scripts, server-side code, local development. | `TigerTokenAuthProvider` | API token (personal access token) | Public |

The session cookie and a JWT both work for UI applications; choose by who should own the sign-in. With the
cookie, users sign in to GoodData through your identity provider, and GoodData keeps the session. With a JWT,
your server vouches for the user, and your app keeps the token fresh. A JWT also keeps working when the browser
blocks the GoodData cookie (see [Cookies across sites](#cookies-across-sites)). Keep API tokens out of anything
you ship to a browser.

Each method also needs setup on the GoodData side. The GoodData Cloud docs cover it:

- Session cookie: [Set Up Authentication Using OpenID Connect Identity Provider](https://www.gooddata.ai/docs/cloud/manage-organization/set-up-authentication/),
  [OIDC Authorization Code Flow](https://www.gooddata.ai/docs/cloud/manage-organization/set-up-authentication/oidc-code-flow/),
  [OIDC Tokens Security](https://www.gooddata.ai/docs/cloud/manage-organization/set-up-authentication/oidc-cookies/),
  and [Federated Identity Management](https://www.gooddata.ai/docs/cloud/manage-organization/set-up-authentication/federated-id-management/).
- JWT: [Set Up Authentication Using JSON Web Tokens](https://www.gooddata.ai/docs/cloud/manage-organization/jwt-access-token/)
  and [Create JWK and JWT in JavaScript](https://www.gooddata.ai/docs/cloud/manage-organization/jwt-access-token/jwt-javascript-example/).
- API token: [Create an API Access Token](https://www.gooddata.ai/docs/cloud/manage-organization/user-token/).
- Any app on another origin than GoodData: [Enable CORS for an Organization](https://www.gooddata.ai/docs/cloud/manage-organization/set-up-cors-for-organization/).

{{% alert color="warning" title="Call onHostname before withAuthentication" %}}
`onHostname` returns a new backend without the provider. Set the host first, or pass it to the factory:
`tigerFactory({ hostname })`.
{{% /alert %}}

## How the SDK handles an expired session

Every provider shares the same request flow, so it's worth knowing before you pick one:

1. Each request goes out with cookies included (`withCredentials`) and, for the token providers,
   `Authorization: Bearer <token>`.
2. When a request returns 401, the SDK calls the provider's `authenticate()` once (a `GET /api/v1/profile`)
   and retries the request.
3. If it fails again, the SDK raises `NotAuthenticated` and calls the provider's `NotAuthenticatedHandler`
   with the authentication context and the error.

The handler runs once for every request that fails, so a dashboard with ten widgets can call it ten times in a
row. Wrap it in a debounce or a call guard.

## Session cookie (context deferred)

`ContextDeferredAuthProvider` sets no header. It relies on the session cookie GoodData sets when the user
signs in through your identity provider, and the browser sends that cookie with every request. "Context
deferred" means the sign-in happens outside the SDK; the provider only reacts when the session is missing.

Pass a handler that sends the user to sign in. `redirectToTigerAuthentication` does the usual thing: it
redirects the whole window to GoodData's login page, which runs the OIDC flow and comes back to the current
page.

```ts
import {
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
    tigerFactory,
} from "@gooddata/sdk-backend-tiger";

const backend = tigerFactory()
    .onHostname("https://example.gooddata.com")
    .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication));
```

Without a handler nothing redirects: the `NotAuthenticated` error reaches your code and the user sees empty
components.

The redirect goes to `<host>/appLogin?redirectTo=<return address>`. When your app runs on the GoodData host,
the return address is a relative path; on any other origin, it's the full URL of the current page. To build
the URL yourself, for example to show a "Sign in" button instead of redirecting at once, call
`createTigerAuthenticationUrl(backend, error.authenticationFlow, window.location)`.

### Pick the identity provider

If your organization uses [Federated Identity Management](https://www.gooddata.ai/docs/cloud/manage-organization/set-up-authentication/federated-id-management/),
tell the login page which identity provider to use:

```ts
import {
    ContextDeferredAuthProvider,
    createRedirectToTigerAuthenticationWithParams,
} from "@gooddata/sdk-backend-tiger";

const authProvider = new ContextDeferredAuthProvider(
    createRedirectToTigerAuthenticationWithParams({ externalProviderId: "my-idp" }),
);
```

### Write your own handler

Write your own `NotAuthenticatedHandler` to show a "Your session expired" message, track the event, or stop
a redirect loop. Debounce it:

```ts
import debounce from "lodash/debounce";
import type { IAuthenticationContext, NotAuthenticated } from "@gooddata/sdk-backend-spi";
import { ContextDeferredAuthProvider, createTigerAuthenticationUrl } from "@gooddata/sdk-backend-tiger";

const onNotAuthenticated = debounce((context: IAuthenticationContext, error: NotAuthenticated) => {
    if (!error.authenticationFlow) {
        return;
    }
    // Ask before leaving the page; a full redirect drops unsaved work.
    if (window.confirm("Your session expired. Sign in again?")) {
        window.location.href = createTigerAuthenticationUrl(
            context.backend,
            error.authenticationFlow,
            window.location,
        );
    }
}, 500);

const authProvider = new ContextDeferredAuthProvider(onNotAuthenticated);
```

### Renew the session without leaving the page

A full-page redirect throws away the app's state. If your users still have a session at the identity
provider, renew the GoodData cookie in a hidden iframe instead. See
[Renew the session without a redirect](../renew-session-silently/).

### Cookies across sites

The session cookie belongs to the GoodData domain. When your app runs on a different site, for example
`analytics.example.com` against `example.gooddata.com`, the browser treats it as a third-party cookie. Safari,
Firefox in strict mode, and Chrome in incognito block those. The symptom is a loop: the user signs in, comes
back, every request returns 401, and the handler redirects to sign in again.

Fix it in one of these ways:

- Serve your app and GoodData from the same site.
- Proxy the GoodData API through your app's own domain, so the cookie is first-party. See
  [Resolve cross-origin errors](../cross-origin-issues/).
- Use a [JWT](#jwt-from-your-portal). A bearer token travels in a header, so third-party cookie rules don't
  apply.

Any origin other than the GoodData host also needs to be in the organization's allowed origins (CORS). See
[Resolve cross-origin errors](../cross-origin-issues/#allow-your-origin-in-production).

## JWT from your portal

{{% alert color="warning" title="Alpha API" %}}
`TigerJwtAuthProvider`, `JwtIsAboutToExpireHandler`, and `SetJwtCallback` are `@alpha`: they can change in any
release. See [API maturity](../platform/api-maturity/).
{{% /alert %}}

Use a JWT when your portal has already signed the user in and you don't want a second sign-in to GoodData. Your
server, or your identity provider, signs a short-lived token for the user with a private key; GoodData checks
the signature with the matching public key (a JWK) that you registered in the organization.

```text
Browser (your portal)          Your server or your IdP         GoodData
  1. user signs in  ─────────▶  session
  2. app asks for a token ───▶  signs a JWT (sub = GoodData user ID)
  3. app gets the JWT  ◀──────
  4. SDK request + Authorization: Bearer <JWT> ─────────────▶  verifies with your JWK
  5. ~60 s before exp: app asks for a new token (step 2 again)
```

### Set up GoodData to accept your JWTs

Do this once per organization. [Set Up Authentication Using JSON Web Tokens](https://www.gooddata.ai/docs/cloud/manage-organization/jwt-access-token/)
has the full steps, and [Create JWK and JWT in JavaScript](https://www.gooddata.ai/docs/cloud/manage-organization/jwt-access-token/jwt-javascript-example/)
shows them in code. In short:

1. Generate an RSA key pair. The private key stays on your server.
2. Upload the public key as a JWK with `POST /api/v1/entities/jwks`. You need the `Organization.MANAGE`
   permission.
3. Sign each JWT with `RS256` (or `RS384`, `RS512`), the JWK's `kid` in the header, and these claims:
   `sub` (the user's ID in the GoodData organization), `name`, `iat`, `exp`, and `jti`.

Keep `exp` short, for example 15 minutes. The token sits in a JavaScript variable, so anyone with access to
the page can copy it and use it until it expires.

### Let your identity provider sign the token

GoodData doesn't need to know who signed a JWT, only that the signature matches a key you uploaded. Your
identity provider (Okta, Auth0, Amazon Cognito, and others) can sign the tokens instead of your server when:

- **Its public signing key is uploaded to GoodData** as a JWK, with the same `kid` the provider puts in the
  token header. Providers rotate their keys; upload the new key before the provider starts signing with it,
  or GoodData rejects the tokens.
- **`sub` is the user's ID in GoodData.** A provider's `sub` is usually its own user ID. Either create the
  GoodData users with that ID, or configure the provider to put the GoodData user ID in `sub`.
- **The token has the algorithm and claims listed above:** `RS256`, `RS384`, or `RS512`, plus `name`, `iat`,
  `exp`, and `jti`.

Before you rely on it, send one of the provider's tokens to `GET /api/v1/profile` with
`Authorization: Bearer <token>`. A 200 with the right user means GoodData accepts the provider's tokens.

### Hand the token to the app

Sign tokens only on your server or at your identity provider; never put the private key in the browser. How the app gets the token depends
on how it runs inside your portal.

**The app is part of your portal.** Expose an endpoint that uses the portal's own session to identify the user
and returns a fresh JWT:

```ts
async function fetchGoodDataJwt(): Promise<string> {
    // Your portal's endpoint. It reads the portal session cookie and signs a JWT for that user.
    const response = await fetch("/portal-api/gooddata-token", { credentials: "include" });
    if (!response.ok) {
        throw new Error(`Cannot get a GoodData token: ${response.status}`);
    }
    const { jwt } = await response.json();
    return jwt;
}
```

If your identity provider signs the tokens, get them from its browser SDK instead, the same way your app gets
any other token from it, and return that from `fetchGoodDataJwt`.

**The app runs in an iframe of your portal.** Let the parent page fetch the token and post it to the iframe.
Name the exact target origin when you post, and check `event.origin` when you receive:

```ts
// In the iframe (your GoodData.UI app)
const PORTAL_ORIGIN = "https://portal.example.com";

function requestJwtFromPortal(): Promise<string> {
    return new Promise((resolve) => {
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== PORTAL_ORIGIN || event.data?.type !== "gooddata-jwt") {
                return;
            }
            window.removeEventListener("message", onMessage);
            resolve(event.data.jwt);
        };
        window.addEventListener("message", onMessage);
        window.parent.postMessage({ type: "gooddata-jwt-request" }, PORTAL_ORIGIN);
    });
}
```

Don't pass the token in the iframe URL: URLs end up in browser history, server logs, and `Referer` headers.

### Create the provider and refresh the token

```ts
import {
    tigerFactory,
    TigerJwtAuthProvider,
    type JwtIsAboutToExpireHandler,
} from "@gooddata/sdk-backend-tiger";
import type { NotAuthenticatedHandler } from "@gooddata/sdk-backend-spi";

// Called about 60 seconds before the token's `exp`. Get a new token and pass it on.
const onJwtAboutToExpire: JwtIsAboutToExpireHandler = (setJwt) => {
    fetchGoodDataJwt()
        .then((jwt) => setJwt(jwt))
        .catch((error) => console.error("GoodData token refresh failed", error));
};

// Called when GoodData rejects the token, for example after it expired.
const onNotAuthenticated: NotAuthenticatedHandler = () => {
    // Show a message, or send the user back through your portal's sign-in.
};

const jwtProvider = new TigerJwtAuthProvider(
    await fetchGoodDataJwt(),
    onNotAuthenticated,
    onJwtAboutToExpire,
    60, // seconds before `exp` to call onJwtAboutToExpire
);

const backend = tigerFactory().onHostname("https://example.gooddata.com").withAuthentication(jwtProvider);
```

The SDK reads `exp` from the token to time the reminder; it doesn't check the signature, GoodData does. Keep in
mind:

- **The refresh resets the reminder to 60 seconds.** `setJwt` ignores the second argument, so a custom value
  from the constructor applies to the first token only. To keep it, call `jwtProvider.updateJwt(jwt, seconds)`
  yourself instead of `setJwt`.
- **A new token must be for the same user.** `updateJwt` throws when the new token's `sub` differs. To switch
  users, create a new provider and backend.
- **Create the backend before you update the token.** `updateJwt` and `updateApiToken` throw when no backend
  uses the provider yet.
- **Don't use `redirectToTigerAuthentication` as the handler.** It sends the user to the GoodData login page,
  not to your portal's sign-in.
- **Allow your origin.** Requests carry an `Authorization` header, so the organization must list your app's
  origin in its allowed origins.

## API token

An API token, also called a personal access token, acts on behalf of the user who created it. Use it for
scripts, server-side code, and local development. See
[Create an API Access Token](https://www.gooddata.ai/docs/cloud/manage-organization/user-token/) for how to
get one.

```ts
import { tigerFactory, TigerTokenAuthProvider } from "@gooddata/sdk-backend-tiger";

const tokenProvider = new TigerTokenAuthProvider(process.env.TIGER_API_TOKEN!);
const backend = tigerFactory().onHostname("https://example.gooddata.com").withAuthentication(tokenProvider);

// After rotating the token; updates every backend created from this provider.
tokenProvider.updateApiToken(newToken);
```

{{% alert color="warning" title="Keep API tokens out of the browser" %}}
A token in a UI bundle can be found and reused by anyone who loads the page, with the full rights of the user
who created it, until someone deletes the token.
{{% /alert %}}

A common setup uses a token in local development and the session cookie everywhere else. With Vite, keep the
token in an untracked `.env.local` file and make sure no production build sees it:

```ts
import { ContextDeferredAuthProvider, redirectToTigerAuthentication, TigerTokenAuthProvider } from "@gooddata/sdk-backend-tiger";

const devToken = import.meta.env.DEV ? import.meta.env.VITE_TIGER_API_TOKEN : undefined;

const authProvider = devToken
    ? new TigerTokenAuthProvider(devToken)
    : new ContextDeferredAuthProvider(redirectToTigerAuthentication);
```

`VITE_` variables are written into the bundle, which is why the check on `import.meta.env.DEV` matters. Vite exposes only `VITE_`-prefixed variables to app code, so the dev token needs its own `VITE_TIGER_API_TOKEN` entry next to the `TIGER_API_TOKEN` that tools such as `gdc-catalog-export` read.

## Log out

Call `deauthenticate` on the backend. It redirects the window to the GoodData `/logout` endpoint, which ends
the GoodData session, and then to `returnTo`:

```ts
await backend.deauthenticate("https://app.example.com/goodbye");
```

`returnTo` isn't URL-encoded for you; encode any query string in it. Without it, GoodData picks the
destination.

With a JWT or an API token there's no GoodData session to end, and `deauthenticate` still redirects to the
GoodData logout page. Sign the user out of your portal instead, and drop the backend.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Sign-in succeeds, then the app redirects to sign in again, forever. | The browser blocks the GoodData cookie as a third-party cookie. | Same site, a proxy, or a JWT. See [Cookies across sites](#cookies-across-sites). |
| Requests fail with a CORS error. | Your origin isn't in the organization's allowed origins. | Add it. See [Resolve cross-origin errors](../cross-origin-issues/). |
| Components stay empty, and the console shows `NotAuthenticated`. | `ContextDeferredAuthProvider` without a handler. | Pass `redirectToTigerAuthentication` or your own handler. |
| The handler runs many times at once. | It runs once per failed request. | Debounce it or guard it. |
| Your own `fetch` calls to the GoodData API get an HTML login page instead of 401. | The request lacks the headers the SDK adds. | Send `X-Requested-With: XMLHttpRequest`, and `credentials: "include"` for the cookie. |
| JWT requests return 403. | An IP allowlist policy applies to the user. | Call from an allowed address, or change the policy. |
| The token refresh fails with the error "The new JWT does not belong to the same subject". | The refreshed token is for a different user. | Sign tokens for the same `sub`, or create a new provider. |

For [Web Components](../web-components/web-components-auth/), the script can sign the user in for you with
`?auth=sso`, or you pass a backend built as on this page.
