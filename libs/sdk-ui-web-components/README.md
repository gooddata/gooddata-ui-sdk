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

Script has to be of type `module`, as we are using JavaScript modules for this distribution.

An `auth` query parameter is optional. When set to `sso`, the library will trigger automatic SSO flow when user is not
authenticated with GoodData.CN or GoodData Cloud server, i.e. will redirect user to the authentication flow and then
back once user is authorized.

## Custom authentication flow

If you want to customize the authentication flow, you'll need to provide the authenticated backend by yourself. For example:

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

Once authentication is set and ready, you can embed Dashboard, single visualization or AI Chat as follows:

```html
<!-- Embedding dashboard with ID "my-dashboard-id" -->
<gd-dashboard dashboard="my-dashboard-id"></gd-dashboard>

<!-- Embedding insight with ID "my-insight-id" -->
<gd-insight insight="my-insight-id"></gd-insight>

<!-- Embedding AI chat -->
<gd-ai-chat />
```

### Dashboard Custom Element

`gd-dashboard` supports the following attributes:

-   `dashboard` - an ID of the dashboard to embed.
-   `workspace` - optional, an ID of the workspace for this dashboard. By default, it's taken from the context (e.g. from the script URL).
-   `readonly` - if enabled, the dashboard will be embedded in read-only mode disabling any user interaction that would alter any backend state (disabling creating/changing alerts, creating scheduled emails, and so on).
-   `locale` - the localization of the visualization. For available languages, see [the full list of available localizations](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts).
-   `mapbox` - the map access token to be used by [geo pushpin charts](https://sdk.gooddata.com/gooddata-ui/docs/geo_pushpin_chart_component.html#geo-config).

`gd-dashboard` emits events from [this list](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.dashboardeventtype.html).
Events do not bubble and are not cancelable. Here is how you can subscribe to one from your code:

```html
<gd-dashboard dashboard="my-dashboard-id" id="some-dom-id"></gd-dashboard>
<script>
    const dashboardEl = document.getElementById("some-dom-id");
    dashboardEl.addEventListener("GDC.DASH/EVT.INITIALIZED", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });
</script>
```

### Insight Custom Element

`gd-insight` supports the following attributes:

-   `insight` - an ID of the insight to embed.
-   `workspace` - optional, an ID of the workspace for this dashboard. By default, it's taken from the context (e.g. from the script URL).
-   `locale` - the localization of the visualization. For available languages, see [the full list of available localizations](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts).
-   `title` - if provided as a boolean shortcut attribute, will render the insight title. If provided as a string, will override the default value and render the visualization with that string.
-   `mapbox` - the map access token to be used by [geo pushpin charts](https://sdk.gooddata.com/gooddata-ui/docs/geo_pushpin_chart_component.html#geo-config).

```html
<!-- with no `title` attribute, the title will not be rendered -->
<gd-insight insight="my-insight"></gd-insight>

<!-- with boolean `title` attribute, the title will be loaded from server and rendered above the visualization -->
<gd-insight insight="my-insight" title></gd-insight>

<!-- with string `title` attribute, the title will be overridden and rendered above the visualization -->
<gd-insight insight="my-insight" title="My custom attribute title"></gd-insight>
```

`gd-insight` emits the following events:

-   `drill` - when drill is initiated by the user.
-   `error` - an error occurred while evaluating the data for the insight.
-   `exportReady` - user requested the export, and it's now ready.
-   `loadingChanged` - loading state of the insight has changed.
-   `insightLoaded` - insight data is fully loaded.

All events are not cancellable and do not bubble. For more info on the event payload, see callback description of [the
InsightView component](https://sdk.gooddata.com/gooddata-ui/docs/visualization_component.html#properties).

```html
<gd-insight insight="my-insight" id="some-dom-id"></gd-insight>
<script>
    const insightEl = document.getElementById("some-dom-id");
    insightEl.addEventListener("drill", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });
</script>
```

### AI chat Custom Element

`gd-ai-chat` supports the following attributes:

-   `workspace` - optional, an ID of the workspace for this dashboard. By default, it's taken from the context (e.g. from the script URL).
-   `locale` - the localization of the visualization. For available languages, see [the full list of available localizations](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts).

```html
<!-- rewrite currently used workspace -->
<gd-ai-chat workspace="my-workspace"></gd-ai-chat>

<!-- rewriting used locales in chat -->
<gd-ai-chat locale="cs-CZ"></gd-ai-chat>
```

`gd-ai-chat` emits the following events:

-   `linkClick` - when user clicks on a link in the chat.
-   `chatOpened` - when the chat is opened.
-   `chatClosed` - when the chat is closed.
-   `chatReset` - when the chat is reset.
-   `chatUserMessage` - when user message is added to the chat.
-   `chatAssistantMessage` - when assistant message is added to the chat.
-   `chatFeedback` - when user provides feedback on the assistant message.
-   `chatVisualizationError` - when an error occurs while rendering the visualization in the chat.

All events are not cancellable and do not bubble.

```html
<gd-ai-chat id="some-dom-id"></gd-ai-chat>
<script>
    const chatEl = document.getElementById("some-dom-id");
    chatEl.addEventListener("linkClick", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });
</script>
```

## License

(C) 2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-charts/LICENSE).
