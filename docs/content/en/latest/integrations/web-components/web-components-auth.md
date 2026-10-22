---
legacy_path: learn/web_components/authentication
title: Authenticate Web Components
linkTitle: Web Components authentication
category: Integrations / Web Components
diataxis_type: howto
source_files:
  - src/index.ts
  - libs/sdk-backend-tiger/src/auth.ts
related_pages:
  - /docs/integrations/web-components/web-components-overview
  - /docs/integrations/authentication
  - /docs/integrations/web-components/embed-custom-elements
  - /docs/integrations/web-components/dashboard-custom-element
  - /docs/integrations/web-components/insight-custom-element
description: Authenticate Web Components against GoodData using the auth=sso script parameter for automatic SSO or setContext for a programmatic flow.
ai_generated_description: true
type: docs
weight: 85
section: Integrations
subsection: Web Components
aliases:
  - "../../learn/web_components/authentication/"
---

The Web Components library can sign the user in to GoodData automatically when you add the `auth` query parameter to the script URL. For more control over the flow, [authenticate the user programmatically](#programmatic-authentication) instead.

The only supported value of the `auth` parameter is `sso`. With it, the script checks whether the user is signed in and, if not, redirects the user to the sign-in page of your identity provider. See [Automatic authentication](#automatic-authentication).

Without the `auth` parameter, or with any other value, the library doesn't sign the user in and expects you to set up [programmatic authentication](#programmatic-authentication).
Until you call `setContext`, the custom elements on the page render nothing or a loading indicator, and after five seconds the library logs a console warning that no authentication context was provided.

{{% alert color="info" %}}
All your users must have a GoodData account and have access to your GoodData workspace.
{{% /alert %}}

## Programmatic authentication

To customize the authentication flow, create the authenticated backend yourself. Next to the library, your GoodData instance serves `tigerBackend.js`, which exports the backend factory for GoodData Cloud and GoodData.CN (code name `tiger`).

A custom authentication setup looks like this:

```html
<script type="module">
    // Import the library along with the `setContext` method
    import { setContext } from "https://example.gooddata.com/components/my-workspace.js";
    // Import the backend factory for GoodData.CN and GoodData Cloud
    import {
        tigerFactory,
        ContextDeferredAuthProvider,
    } from "https://example.gooddata.com/components/tigerBackend.js";

    // Called with the authentication context and the NotAuthenticated error,
    // once per failed request, so guard or debounce it
    function myAuthenticationHandler(context, error) {
        // ... define the logic for custom authentication flow
    }

    // Set up the backend and the default workspace ID
    setContext({
        backend: tigerFactory()
            .onHostname("https://example.gooddata.com")
            .withAuthentication(new ContextDeferredAuthProvider(myAuthenticationHandler)),
        workspaceId: "my-workspace",
    });
</script>
```

See [Authenticate to the backend](../../authentication/) for the other provider options, including a JWT from your own portal and API tokens (development only). `tigerBackend.js` exports everything from `@gooddata/sdk-backend-tiger`, so every provider on that page is available here.

The `gd-dashboard-embed` and `gd-insight-embed` elements also accept a per-element `context` property with the same `{ backend, workspaceId }` shape, which overrides the shared context for that element only. See [Dashboard and visualization embed elements](../embed-custom-elements/#how-inputs-resolve).

## Automatic authentication

Add the `?auth=sso` parameter to the script URL to sign users in automatically on GoodData Cloud and GoodData.CN:

```html
<script type="module" src="https://example.gooddata.com/components/my-workspace.js?auth=sso"></script>
```

This is equivalent to the following programmatic setup:

```html
<script type="module">
    import { setContext } from "https://example.gooddata.com/components/my-workspace.js";
    import {
        tigerFactory,
        ContextDeferredAuthProvider,
        redirectToTigerAuthentication,
    } from "https://example.gooddata.com/components/tigerBackend.js";

    setContext({
        backend: tigerFactory()
            .onHostname("https://example.gooddata.com")
            .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication)),
        workspaceId: "my-workspace",
    });
</script>
```

Whenever the user isn't signed in to GoodData, the library redirects the browser window to the identity provider configured in GoodData. After the user signs in, the identity provider redirects the window back to the page the user started on.

If your organization uses Federated Identity Management, pass the user's identity provider ID to the redirect: replace `redirectToTigerAuthentication` with the handler that `createRedirectToTigerAuthenticationWithParams({ externalProviderId })` returns, imported from the same `tigerBackend.js`. See [Pick the identity provider](../../authentication/#pick-the-identity-provider).
