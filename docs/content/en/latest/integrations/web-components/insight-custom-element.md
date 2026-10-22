---
legacy_path: learn/web_components/insight_custom_element
title: Visualization custom element
category: Integrations / Web Components
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-ext:InsightView"
source_files:
  - src/insightView/InsightView.tsx
props_interfaces:
  - IInsightViewProps
  - Partial<IVisualizationCallbacks>
related_pages:
  - /docs/integrations/web-components/embed-custom-elements
  - /docs/integrations/web-components/web-components-overview
  - /docs/integrations/web-components/web-components-auth
  - /docs/visualisations/insightview
  - /docs/integrations/web-components/dashboard-custom-element
type: docs
description: Embed a saved visualization with the legacy gd-insight element, set its workspace, locale, title, filters, and size, and subscribe to its events.
weight: 83
section: Integrations
subsection: Web Components
aliases:
  - "../../learn/web_components/insight_custom_element/"
---

{{% alert color="info" title="Legacy element" %}}
`gd-insight` is the legacy visualization element, kept for existing integrations. For new integrations, use `gd-insight-embed`, which adds the `filters`, `title`, `config`, and `context` properties, the `refresh()` method, and the `gd-ready` and `gd-error` events. See [Dashboard and visualization embed elements](../embed-custom-elements/).
{{% /alert %}}

`gd-insight` embeds a single saved visualization. It renders the [`InsightView`](../../../visualisations/insightview/) component:

```html
<!-- minimal setup -->
<gd-insight insight="my-visualization-id"></gd-insight>
```

{{% alert color="info" title="Give the element a height" %}}
The `gd-insight` element uses a flex layout that adjusts to the size of its container. If the container doesn't have `display: flex`, the element has zero height. You can also set the height explicitly with CSS, for example with the inline `style="height: 500px"`.
{{% /alert %}}

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

## Supported attributes

```html
<!-- all supported attributes -->
<gd-insight
    insight="my-visualization-id"
    workspace="my-workspace-id"
    locale="en-US"
    title="Custom visualization title"
    mapbox="my-mapbox-token"
    agGrid="my-ag-grid-license-key"
></gd-insight>
```

- `insight` - required, the ID of the visualization to embed.
- `workspace` - optional, the ID of the workspace of this visualization. By default, it's taken from the context, for example from the script URL.
- `locale` - optional, defaults to `en-US`. The localization of the visualization UI. Use the hyphenated form (`en-US`, `de-DE`); an unknown value falls back to `en-US`. For all available languages, see [the full list of available localizations][1].
- `title` - optional. As a boolean attribute, it renders the title stored with the visualization. As a string, it renders that string instead.
- `filters` - optional, a JSON array of filter objects applied to the visualization. An invalid value is logged with `console.error` and ignored.
- `mapbox` - optional, a Mapbox access token used by geo charts. Overrides the `mapboxToken` from the context.
- `agGrid` - optional, an AG Grid license key used by pivot tables. Overrides the `agGridToken` from the context.

```html
<!-- with no `title` attribute, the title isn't rendered -->
<gd-insight insight="my-visualization"></gd-insight>

<!-- with a boolean `title` attribute, the title is loaded from the server and rendered above the visualization -->
<gd-insight insight="my-visualization" title></gd-insight>

<!-- with a string `title` attribute, that string is rendered above the visualization -->
<gd-insight insight="my-visualization" title="My custom title"></gd-insight>
```

You can also set the workspace ID once on the context instead of passing it to every element. See the code example in [Web Components authentication][2].

{{% alert color="info" %}}
The locale affects only the UI elements, not your data or the metadata language.
{{% /alert %}}

## Supported events

`gd-insight` emits the following events. The `detail` of each event is the argument of the matching [`InsightView` callback][3]:

- `drill` - the user drilled in the visualization. The detail is the drill event, `IDrillEvent`.
- `error` - loading or computing the visualization failed. The detail is the `GoodDataSdkError`.
- `exportReady` - the visualization is ready to be exported. The detail is the export function, `IExportFunction`; call it to export the data.
- `loadingChanged` - the loading state of the visualization changed. The detail is `ILoadingState`.
- `insightLoaded` - the visualization definition has loaded. The detail is the `IInsight`.

Events don't bubble and aren't cancelable. Subscribe to them as to any other DOM event:

```html
<gd-insight insight="my-visualization" id="some-dom-id"></gd-insight>
<script>
    const insightEl = document.getElementById("some-dom-id");
    insightEl.addEventListener("insightLoaded", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });
</script>
```

[1]: https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-model/src/base/localization.ts
[2]: ../web-components-auth/
[3]: ../../../visualisations/insightview/#props
