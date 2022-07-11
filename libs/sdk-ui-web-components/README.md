# GoodData Web Component

This library provides a set of Custom Elements (aka Web Components) to easy the embedding of GoodData visualizations
into web applications.

The library is meant to be hosted by GoodData.CN and GoodData Cloud for easier integration.
At this time we do not provide an NPM package that you can import directly.

## Integration

To integrate the library into your app, all you need to do is to integrate a script tag with a correct URL to the `<head>`
section of your application.

```html
<script type="module" src="https://{your-GD-server-URL}/components/{workspaceId}.mjs?auth=sso"></script>

<!-- for example -->
<script type="module" src="https://analytics.example.com/components/my-workspace.mjs?auth=sso"></script>
```

Script has to be of type `module`, as we are using JavaScript modules for this distribution.

An `auth` query parameter is optional. When set to `sso`, the library will trigger automatic SSO flow when user is not
authenticated with GoodData server, i.e. will redirect user to the authentication flow and then back once user is authorized.

## Custom authentication flow

If you want to customize the authentication flow, you'll need to provide the authenticated backend by yourself. For example:

```html
<script type="module">
    import { setContext } from "https://analytics.example.com/components/my-workspace.mjs";
    import tigerFactory, {
        ContextDeferredAuthProvider,
        redirectToTigerAuthentication,
    } from "https://analytics.example.com/components/tigerBackend.mjs";

    setContext({
        backend: tigerFactory()
            .onHostname("https://analytics.example.com")
            // Following is the part that you might want to change in case of a custom authentication flow
            .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication)),
        workspaceId: "my-workspace",
    });
</script>
```

## Embedding

Once authentication is set and ready, you can embed Dashboard or a single visualization as follows:

```html
<!-- Embedding dashboard with ID "my-dashboard-id" -->
<gd-dashboard dashboard="my-dashboard-id"></gd-dashboard>

<!-- Embedding insight with ID "my-insight-id" -->
<gd-insight dashboard="my-insight-id"></gd-insight>
```

### Dashboard Custom Element

`gd-dashboard` supports the following attributes:

-   `dashboard` - an ID of the dashboard to embed.
-   `workspace` - optional, an ID of the workspace for this dashboard. By default, it's taken from the context (e.g. from the script URL).
-   `readonly` - if enabled, the dashboard will be embedded in read-only mode disabling any user interaction that would alter any backend state (disabling creating/changing alerts, creating scheduled emails, and so on).
-   `locale` - the localization of the visualization. For available languages, see [the full list of available localizations](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts).
-   `mapbox` - the map access token to be used by [geo pushpin charts](https://sdk.gooddata.com/gooddata-ui/docs/geo_pushpin_chart_component.html#geo-config).

`gd-dashboard` emits events from [this list](https://sdk.gooddata.com/gooddata-ui-apidocs/v8.9.0/docs/sdk-ui-dashboard.dashboardeventtype.html).
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

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-charts/LICENSE).
