---
title: Visualization custom element
sidebar_label: Visualization custom element
copyright: (C) 2007-2022 GoodData Corporation
id: webcomponents_insight
---

For new integrations, embed a single visualization using the `gd-insight-embed` custom element.
The legacy `gd-insight` tag remains available for existing integrations that depend on the original attribute-driven behavior.

```html
<!-- minimal setup -->
<gd-insight-embed insight="my-visualization-id"></gd-insight-embed>
```

> The `gd-insight-embed` element is using the flex layout that adjusts to the size of its container.
>
> If the container does not have the `display` property set to `flex`, the widget will have zero height.
>
> You can also define the element height explicitly with CSS, for example, using the inline `style` attribute: `style="height:500px"`.

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

## Supported properties

Properties are set from JavaScript after the element is in the DOM. Assigning a new object reference
replaces the previous snapshot and schedules a re-render.

```js
const insightEl = document.getElementById("some-dom-id");

insightEl.context = { backend: myBackend, workspaceId: "my-workspace-id" };
insightEl.filters = [{ positiveAttributeFilter: { displayForm: { identifier: "attr.region" }, in: ["US"] } }];
insightEl.title = "My custom title";
```

> Always assign a **new object reference**. Mutating an existing object in place will not trigger a re-render.

| Property  | Type                                                    | Notes                                                  |
| --------- | ------------------------------------------------------- | ------------------------------------------------------ |
| `context` | `{ backend, workspaceId?, mapboxToken?, agGridToken? }` | Live — replaces the previous context snapshot          |
| `config`  | `IInsightViewProps["config"]`                           | Live — replaces the previous config snapshot           |
| `insight` | string                                                  | Identity — immutable after the first successful render |
| `filters` | filter array                                            | Live — declarative filter list, triggers re-render     |
| `title`   | `string \| boolean`                                     | Live — overrides the visualization title               |

## Supported attributes

HTML attributes are used for the initial bootstrap only. Changing an attribute after the first render has
no effect; use the corresponding property instead.

```html
<!-- all supported attributes -->
<gd-insight-embed
    insight="my-visualization-id"
    workspace="my-workspace-id"
    locale="en_US"
    title="Custom visualization title"
    mapbox="my-mapbox-token"
    agGrid="my-ag-grid-license"
></gd-insight-embed>
```

- `insight` - mandatory, the ID of the visualization to embed.
- `workspace` - optional, the ID of the workspace for this visualization. By default, it is taken from the context (e.g., from the script URL).
- `locale` - optional, defaults to `en-US`. The localization of the visualization. For all available languages, see [the full list of available localizations][1].
- `title` - optional. If provided as a boolean shortcut attribute, it will render the visualization title. If provided as a string, it will override the default value and render the visualization with that string.
- `mapbox` - optional, a Mapbox token for geo visualizations.
- `agGrid` - optional, an AG Grid license key.

```html
<!-- with no `title` attribute, the title will not be rendered -->
<gd-insight-embed insight="my-visualization"></gd-insight-embed>

<!-- with boolean `title` attribute, the title will be loaded from server and rendered above the visualization -->
<gd-insight-embed insight="my-visualization" title></gd-insight-embed>

<!-- with string `title` attribute, the title will be overridden and rendered above the visualization -->
<gd-insight-embed insight="my-visualization" title="My custom attribute title"></gd-insight-embed>
```

You can also provide a workspace id on the context level instead of passing it as an attribute to every visualization. See the code example of the [Web Components authentication][2] article.

> The locale property affects only the UI elements and not your data or the metadata language.

## Supported methods

```js
// Reinitializes the visualization using the current context and config snapshots.
await insightEl.refresh();
```

## Supported events

`gd-insight-embed` emits the following events:

- `drill` - a drill interaction was initiated by the user.
- `error` - an error occurred while evaluating the data for the visualization.
- `exportReady` - a user requested the export and it is ready.
- `loadingChanged` - loading state of the visualization has changed.
- `insightLoaded` - visualization data is fully loaded.
- `gd-ready` - first successful render completed.
- `gd-error` - initialization or runtime failure occurred.

Events **do not bubble** and **are not cancelable**. For more info on the event payload, see the callback description of
[the InsightView component][3].

You can subscribe to the events the same way as to any other DOM event:

```html
<gd-insight-embed insight="my-visualization" id="some-dom-id"></gd-insight-embed>
<script>
    const insightEl = document.getElementById("some-dom-id");
    insightEl.addEventListener("insightLoaded", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });

    insightEl.addEventListener("gd-error", (event) => {
        const { phase, message, cause } = event.detail;
        // phase: "init" | "update" | "refresh" | "invalidUsage"
        console.error(phase, message, cause);
    });
</script>
```

The `gd-error` event detail has the following shape:

| Field     | Type    | Description                                                                     |
| --------- | ------- | ------------------------------------------------------------------------------- |
| `phase`   | string  | When the error occurred: `"init"`, `"update"`, `"refresh"`, or `"invalidUsage"` |
| `message` | string  | Human-readable error description                                                |
| `cause`   | unknown | The underlying error object, if available                                       |

## Legacy compatibility tag

`gd-insight` remains available for older integrations that are centered around attribute-driven updates and
expect the original custom element behavior. Prefer `gd-insight-embed` for new embedding work; use `gd-insight`
only when you need continuity with an existing integration.

```html
<!-- minimal setup -->
<gd-insight insight="my-visualization-id"></gd-insight>
```

### Supported attributes

`gd-insight` is fully attribute-driven. Changing any observed attribute after mount triggers a full re-render.

```html
<gd-insight
    insight="my-visualization-id"
    workspace="my-workspace-id"
    locale="en_US"
    title="Custom title"
    mapbox="my-mapbox-token"
    filters='[{"positiveAttributeFilter":{"displayForm":{"identifier":"attr.region"},"in":["US"]}}]'
></gd-insight>
```

- `insight` - mandatory, the ID of the visualization to embed.
- `workspace` - optional, the ID of the workspace. By default, it is taken from the context (e.g., from the script URL).
- `locale` - optional, defaults to `en-US`. The localization of the visualization. For all available languages, see [the full list of available localizations][1].
- `title` - optional. If provided as a boolean shortcut attribute, it renders the visualization title. If provided as a string, it overrides the title.
- `mapbox` - optional, a Mapbox token for geo visualizations.
- `filters` - optional, a JSON-encoded array of filter objects. Changing this attribute after mount triggers a re-render with the new filters.

The `agGrid` attribute is also read at mount time for an AG Grid license key, but changes to it after mount do not trigger a re-render.

### Supported events

`gd-insight` forwards the same visualization events as `gd-insight-embed`. Events **do not bubble** and **are not cancelable**.

```html
<gd-insight insight="my-visualization-id" id="some-dom-id"></gd-insight>
<script>
    const insightEl = document.getElementById("some-dom-id");
    insightEl.addEventListener("insightLoaded", (event) => {
        console.log(event.detail);
    });
</script>
```

`gd-insight` does **not** emit `gd-ready` or `gd-error`, and does not expose a `refresh()` method.
These capabilities are available only on `gd-insight-embed`.

[1]: https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts
[2]: ../authentication/
[3]: https://www.gooddata.ai/docs/gooddata-ui/latest/learn/visualize_data/insightview#properties
