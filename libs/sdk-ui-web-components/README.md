# GoodData Web Components

This library provides a set of Custom Elements (aka Web Components) to make the embedding of GoodData visualizations
into web applications easier.

The library is meant to be hosted by GoodData.CN and GoodData Cloud for easier integration.
At this time we do not provide an NPM package that you can import directly.

## Integration

To integrate the library into your app, all you need to do is to integrate a script tag with a correct URL to the `<head>`
section of your application.

```html
<script type="module" src="https://{your-GD-server-URL}/components/{workspaceId}.js?auth=sso"></script>

<!-- for example -->
<script type="module" src="https://example.gooddata.com/components/my-workspace.js?auth=sso"></script>
```

The script must be of type `module`, as we are using JavaScript modules for this distribution.

The `auth` query parameter is optional. When set to `sso`, the library will trigger an automatic SSO flow when the user is not
authenticated with the GoodData.CN or GoodData Cloud server, i.e., it will redirect the user to the authentication flow and then
back once the user is authorized.

## Custom authentication flow

If you want to customize the authentication flow, you'll need to provide the authenticated backend yourself. For example:

```html
<script type="module">
    import { setContext } from "https://example.gooddata.com/components/my-workspace.js";
    import tigerFactory, {
        ContextDeferredAuthProvider,
        redirectToTigerAuthentication,
    } from "https://example.gooddata.com/components/tigerBackend.js";

    setContext({
        backend: tigerFactory()
            .onHostname("https://example.gooddata.com")
            // Following is the part that you might want to change in case of a custom authentication flow
            .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication)),
        workspaceId: "my-workspace",
        // Optional, mapbox token
        mapboxToken: "my-mapbox-token",
    });
</script>
```

## Embedding

Once authentication is set up and ready, you can embed a Dashboard, single visualization, or AI Assistant as follows:

```html
<!-- Recommended dashboard embed runtime -->
<gd-dashboard-embed dashboard="my-dashboard-id"></gd-dashboard-embed>

<!-- Recommended insight embed runtime -->
<gd-insight-embed insight="my-insight-id"></gd-insight-embed>

<!-- Embedding AI Assistant -->
<gd-ai-assistant />
```

`gd-dashboard-embed` and `gd-insight-embed` are the recommended embedding tags for new integrations.
They expose the current property-first API surface.

`gd-dashboard` and `gd-insight` remain available with the original attribute-driven runtime for continuity of existing integrations.

Migration expectations at a high level:

- New integrations should use `gd-dashboard-embed` and `gd-insight-embed`.
- Existing `gd-dashboard` and `gd-insight` integrations continue to use the original behavior for compatibility.
- When migrating from legacy tags, prefer property-driven updates on the embed runtime.

You can also specify the path to load static files from a different location.
The path is modified by setting the `__GD_ASSET_PATH__` window property before the script is loaded.
By default, the library will load static files from the same location as the script itself,
hence the default behavior is as if `__GD_ASSET_PATH__` was set to `.`.

```html
<script>
    window.__GD_ASSET_PATH__ = "https://cdn.example.com/assets/";
</script>
<script type="module" src="https://example.gooddata.com/components/my-workspace-id.js?auth=sso"></script>
```

### Dashboard Custom Elements

`gd-dashboard-embed` is the strict, property-first dashboard runtime.
`gd-dashboard` keeps the original attribute-driven dashboard runtime for legacy integrations.

`gd-dashboard-embed` is property-first:

- Properties are the live control surface.
- Property assignment replaces the previous snapshot.
- Bootstrap attributes stay minimal and are meant only for initial setup.
- The `dashboard` identity is immutable after the first successful render.

Supported properties:

- `context` - `{ backend, workspaceId?, mapboxToken?, agGridToken? }`
- `config` - dashboard config snapshot passed to the SDK Dashboard component
- `dashboard` - dashboard identifier

Supported attributes:

- `dashboard` - bootstrap identity
- `workspace` - bootstrap workspace override
- `readonly` - bootstrap convenience for dashboard config
- `locale` - bootstrap convenience for dashboard config
- `mapbox` - bootstrap mapbox token
- `agGrid` - bootstrap AG Grid token

Supported methods:

- `refresh(): Promise<void>` - reinitializes the dashboard using the current `config` snapshot
- `replaceFilters(filters): Promise<void>` - replaces the dashboard filter selection through the dashboard command model

Supported events:

- `gd-ready` - emitted once after the first successful render
- `gd-error` - emitted for initialization failures, invalid usage, and command failures
- dashboard SDK events are still forwarded as custom events using their original event type

Example:

```html
<gd-dashboard-embed dashboard="my-dashboard-id" id="some-dom-id"></gd-dashboard-embed>
<script type="module">
    const dashboardEl = document.getElementById("some-dom-id");

    dashboardEl.context = {
        backend: window.myBackend,
        workspaceId: "my-workspace",
    };
    dashboardEl.config = {
        isReadOnly: true,
    };

    dashboardEl.addEventListener("gd-ready", () => {
        console.log("dashboard ready");
    });

    dashboardEl.addEventListener("gd-error", (event) => {
        console.error(event.detail);
    });

    await dashboardEl.refresh();
</script>
```

### Insight Custom Element

`gd-insight-embed` is the strict insight runtime.
`gd-insight` keeps the original attribute-driven insight runtime for legacy integrations.

`gd-insight-embed` follows the same host model:

- Live properties: `context`, `config`, `insight`, `filters`, `title`
- Bootstrap attributes: `insight`, `workspace`, `locale`, `title`, `mapbox`, `agGrid`, `filters`
- Methods: `refresh(): Promise<void>`
- `insight` identity is immutable after the first successful render

```html
<!-- with no `title` attribute, the title will not be rendered -->
<gd-insight-embed insight="my-insight"></gd-insight-embed>

<!-- with boolean `title` attribute, the title will be loaded from server and rendered above the visualization -->
<gd-insight-embed insight="my-insight" title></gd-insight-embed>

<!-- with string `title` attribute, the title will be overridden and rendered above the visualization -->
<gd-insight-embed insight="my-insight" title="My custom attribute title"></gd-insight-embed>
```

The `filters` and `title` properties are the preferred way to update insight rendering after mount:

```html
<gd-insight-embed insight="my-insight" id="some-dom-id"></gd-insight-embed>
<script type="module">
    const insightEl = document.getElementById("some-dom-id");

    insightEl.context = {
        backend: window.myBackend,
        workspaceId: "my-workspace",
    };
    insightEl.filters = [
        {
            positiveAttributeFilter: {
                /* ... */
            },
        },
    ];
    insightEl.title = "My custom title";

    await insightEl.refresh();
</script>
```

`gd-insight-embed` emits the following events:

- `drill` - when drill is initiated by the user.
- `error` - an error occurred while evaluating the data for the insight.
- `exportReady` - user requested the export, and it's now ready.
- `loadingChanged` - loading state of the insight has changed.
- `insightLoaded` - insight data is fully loaded.
- `gd-ready` - emitted once after the first successful render
- `gd-error` - emitted for initialization failures, invalid usage, and refresh/runtime failures

All events are not cancelable and do not bubble. For more information on the event payload, see the callback description of [the
InsightView component](https://www.gooddata.com/docs/gooddata-ui/latest/learn/visualize_data/insightview#properties).

```html
<gd-insight-embed insight="my-insight" id="some-dom-id"></gd-insight-embed>
<script>
    const insightEl = document.getElementById("some-dom-id");
    insightEl.addEventListener("drill", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });
</script>
```

### AI Assistant Custom Element

`gd-ai-assistant` supports the following attributes:

- `workspace` - optional, an ID of the workspace for this dashboard. By default, it's taken from the context (e.g. from the script URL).
- `locale` - the localization of the visualization. For available languages, see [the full list of available localizations](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts).

```html
<!-- override currently used workspace -->
<gd-ai-assistant workspace="my-workspace"></gd-ai-assistant>

<!-- override locale used in chat -->
<gd-ai-assistant locale="cs-CZ"></gd-ai-assistant>
```

`gd-ai-assistant` emits the following events:

- `linkClick` - when user clicks on a link in the chat.
- `chatOpened` - when the chat is opened.
- `chatClosed` - when the chat is closed.
- `chatReset` - when the chat is reset.
- `chatUserMessage` - when user message is added to the chat.
- `chatAssistantMessage` - when assistant message is added to the chat.
- `chatFeedback` - when user provides feedback on the assistant message.
- `chatVisualizationError` - when an error occurs while rendering the visualization in the chat.

All events are not cancelable and do not bubble.

```html
<gd-ai-assistant id="some-dom-id"></gd-ai-assistant>
<script>
    const chatEl = document.getElementById("some-dom-id");
    chatEl.addEventListener("linkClick", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });
</script>
```

### Debug local build

You need to define the following variables in an `.env` file: `VITE_BACKEND_URL`, `VITE_AUTH_TOKEN`, `VITE_WORKSPACE`, `VITE_DASHBOARD`, `VITE_INSIGHT`.

For the `VITE_BACKEND_URL`, you need to go to your GoodData server settings and configure Cross-Origin Resource Sharing (CORS) to allow requests from:

`http://localhost:9999/`

First, you need to build your changes by running `rushx build-dev`. This will produce a fresh build in the `esm` directory.
Once you have a fresh build, you can run `rushx dev` to start the development server and view the web components.

After each code change, you need to run `rushx build-dev` again.

## License

(C) 2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-charts/LICENSE).
