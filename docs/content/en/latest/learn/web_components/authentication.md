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

## Declarative per-element context

`gd-dashboard-embed` and `gd-insight-embed` accept a `context` property that lets you supply an
authenticated backend directly on the element, without calling `setContext` at all. This is the
recommended approach when you need fine-grained control — for example, when different elements on the
same page connect to different GoodData servers.

```html
<script type="module">
    import factory from "https://example.gooddata.com/components/tigerBackend.js";

    const el = document.querySelector("gd-dashboard-embed");
    el.context = {
        backend: factory()
            .onHostname("https://example.gooddata.com")
            .withAuthentication(/* your auth provider */),
        workspaceId: "my-workspace",
    };
</script>

<gd-dashboard-embed dashboard="my-dashboard-id"></gd-dashboard-embed>
```

Resolution is **field-level**: each field in the element's `context` property takes precedence over the
corresponding field from the global `setContext` context, with the `workspace` attribute as a middle
tier for `workspaceId`. In full:

```
workspaceId:  el.context.workspaceId  →  workspace attribute  →  setContext workspaceId
backend:      el.context.backend      →  setContext backend
mapboxToken:  el.context.mapboxToken  →  setContext mapboxToken
agGridToken:  el.context.agGridToken  →  setContext agGridToken
```

This means you can, for example, set a global backend via `setContext` and then override only the
workspace on individual elements. For the multi-backend case you should supply at minimum `backend` and
`workspaceId` in the element property to ensure the element is fully self-contained.

You can reassign `context` at any time — the element will re-render using the new values without remounting.

This approach is especially useful for **multi-backend scenarios**, where you mount two or more elements
each backed by a different GoodData server:

```html
<gd-dashboard-embed id="primary" dashboard="dashboard-a"></gd-dashboard-embed>
<gd-dashboard-embed id="secondary" dashboard="dashboard-b"></gd-dashboard-embed>

<script type="module">
    import factory from "https://primary.gooddata.com/components/workspace-a.js";
    import factoryB from "https://secondary.gooddata.com/components/workspace-b.js";

    document.getElementById("primary").context = {
        backend: factory().onHostname("https://primary.gooddata.com").withAuthentication(/* ... */),
        workspaceId: "workspace-a",
    };
    document.getElementById("secondary").context = {
        backend: factoryB().onHostname("https://secondary.gooddata.com").withAuthentication(/* ... */),
        workspaceId: "workspace-b",
    };
</script>
```

## Programmatic authentication

To customize the authentication flow globally, you can provide an authenticated backend via `setContext`.
All elements that do not have a `context` property assigned directly will use this global context.

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

[2]: ../../integrate_and_authenticate/cn_and_cloud_authentication/

If your application runs in a Federated Identity Management context, you must propagate the current user's identity provider ID to `redirectToTigerAuthentication`.

To do this, use the `createRedirectToTigerAuthenticationWithParams` function, providing the identity provider ID as a parameter. Then, use the result instead of the default `redirectToTigerAuthentication`.
