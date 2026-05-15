---
title: Visualization custom element
sidebar_label: Visualization custom element
copyright: (C) 2007-2022 GoodData Corporation
id: webcomponents_insight
---

For new integrations, embed a single visualization using the `gd-insight-embed` custom element.
The legacy `gd-insight` tag remains available as a compatibility wrapper that hosts `gd-insight-embed` under the hood.

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

## Supported attributes

```html
<!-- all supported attributes -->
<gd-insight-embed
    insight="my-visualization-id"
    workspace="my-workspace-id"
    locale="en_US"
    title="Custom visualization title"
></gd-insight-embed>
```

- `insight` - mandatory, the ID of the visualization to embed.
- `workspace` - optional, the ID of the workspace for this dashboard. By default, it is taken from the context (e.g., from the script URL).
- `locale` - optional, defaults to `en-US`. The localization of the visualization. For all available languages, see [the full list of available localizations][1].
- `title` - optional. If provided as a boolean shortcut attribute, it will render the visualization title. If provided as a string, it will override the default value and render the visualization with that string.

```html
<!-- with no `title` attribute, the title will not be rendered -->
<gd-insight-embed insight="my-visualization"></gd-insight-embed>

<!-- with boolean `title` attribute, the title will be loaded from server and rendered above the visualization -->
<gd-insight-embed insight="my-visualization" title></gd-insight-embed>

<!-- with string `title` attribute, the title will be overridden and rendered above the visualization -->
<gd-insight-embed insight="my-visualization" title="My custom attribute title"></gd-insight-embed>
```

You can also provide a workspace id on the context level instead of passing it as an attribute to every dashboard. See the code example of the [Web Components authentication][2] article.

> The locale property affects only the UI elements and not your data or the metadata language.

## Supported events

`gd-insight-embed` emits the following events:

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
</script>
```

## Legacy compatibility tag

`gd-insight` remains available for older integrations that are centered around attribute-driven updates.
It acts as a compatibility wrapper over `gd-insight-embed` and remounts the strict runtime when the legacy `insight`
identity attribute changes.

[1]: https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts
[2]: ../authentication/
[3]: https://www.gooddata.ai/docs/gooddata-ui/latest/learn/visualize_data/insightview#properties
