---
title: Web Components authentication
linkTitle: Authentication
copyright: (C) 2007-2022 GoodData Corporation
id: webcomponents_authentication
---

You can configure the Web Components library to automatically attempt user authentication to a GoodData server using the
`auth` query parameter in the script URL.

If you need more control over the authentication flow, you can also [authenticate the user programmatically](#programmatic-authentication).

Currently, the only valid value for the `auth` parameter is `sso`. When set, the script will check the authentication
status and, if needed, the script will redirect the user to the SSO login page. See more about [`?auth=sso` below](#automatic-authentication).

If the `auth` parameter is not provided or has a value other than `sso`, the library will not
run the auto-authentication and will expect you to run the [programmatic authentication](#programmatic-authentication).
Meanwhile, all custom elements present on the page will render a loading animation.

> All your users must have a GoodData account and have access to your GoodData workspace.

## Programmatic authentication

To customize the authentication flow, you must provide the authenticated backend by yourself.
The Web Components library hosts several files that you can import to your browser runtime and expose
a backend factory for GoodData.CN and GoodData Cloud (code name `tiger`).

The custom authentication would look like this:

```html
<script type="module">
    // Import the library along with `setContext` method
    import { setContext } from "https://example.gooddata.com/components/my-workspace.js";
    // Import GoodData.CN backend for GoodData.CN and GoodData Cloud
    import factory, {
        ContextDeferredAuthProvider,
    } from "https://example.gooddata.com/components/tigerBackend.js";

    function myAuthenticationHandler(authError) {
        // ... define the logic for custom authentication flow
    }

    // Set up GoodData.CN backend and default workspace id
    setContext({
        backend: factory()
            .onHostname("https://example.gooddata.com")
            .withAuthentication(new ContextDeferredAuthProvider(myAuthenticationHandler)),
        workspaceId: "my-workspace",
    });
</script>
```

See our documentation for more information on [GoodData.CN authentication][2].

## Automatic authentication

Automatic GoodData.CN SSO will run if you add `?auth=sso` parameter to the script URL. For example:

```html
<script type="module" src="https://example.gooddata.com/components/my-workspace.js?auth=sso"></script>
```

You can also run the following programmatic setup:

```html
<script type="module">
    import { setContext } from "https://example.gooddata.com/components/my-workspace.js";
    import factory, {
        ContextDeferredAuthProvider,
        redirectToTigerAuthentication,
    } from "https://example.gooddata.com/components/tigerBackend.js";

    setContext({
        backend: factory()
            .onHostname("https://example.gooddata.com")
            .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication)),
        workspaceId: "my-workspace",
    });
</script>
```

Whenever a user is not authenticated with the GoodData server, the library will redirect the browser window to the
SSO provider that you configured at GoodData. Once the user is logged in, the SSO provider will redirect the browser window
back to the exact same page it was before the first redirect.

[2]: ../../../integrate_and_authenticate/cn_and_cloud_authentication/

If your application runs in a Federated Identity Management context, you must propagate the current user's identity provider ID to `redirectToTigerAuthentication`.

To do this, use the `createRedirectToTigerAuthenticationWithParams` function, providing the identity provider ID as a parameter. Then, use the result instead of the default `redirectToTigerAuthentication`.
