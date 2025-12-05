---
title: Visualization custom element
sidebar_label: Visualization custom element
copyright: (C) 2007-2022 GoodData Corporation
id: webcomponents_insight
---

You can embed a single visualization into your application using the `gd-insight` custom element with the following:

```html
<!-- minimal setup -->
<gd-insight insight="my-visualization-id"></gd-insight>
```

> The `gd-insight` element is using the flex layout that adjusts to the size of its container. 
>
>If the container does not have the `display` property set to `flex`, the widget will have zero height. 
>
>You can also define the element height explicitly with CSS, for example, using the inline `style` attribute: `style="height:500px"`.

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

## Supported attributes

```html
<!-- all supported attributes -->
<gd-insight
    insight="my-visualization-id"
    workspace="my-workspace-id"
    locale="en_US"
    title="Custom visualization title"
></gd-insight>
```

* `insight` - mandatory, the ID of the visualization to embed.
* `workspace` - optional, the ID of the workspace for this dashboard. By default, it is taken from the context (e.g., from the script URL).
* `locale` - optional, defaults to `en-US`. The localization of the visualization. For all available languages, see [the full list of available localizations][1].
* `title` - optional. If provided as a boolean shortcut attribute, it will render the visualization title. If provided as a string, it will override the default value and render the visualization with that string.

```html
<!-- with no `title` attribute, the title will not be rendered -->
<gd-insight insight="my-visualization"></gd-insight>

<!-- with boolean `title` attribute, the title will be loaded from server and rendered above the visualization -->
<gd-insight insight="my-visualization" title></gd-insight>

<!-- with string `title` attribute, the title will be overridden and rendered above the visualization -->
<gd-insight insight="my-visualization" title="My custom attribute title"></gd-insight>
```

You can also provide a workspace id on the context level instead of passing it as an attribute to every dashboard. See the code example of the [Web Components authentication][2] article.

> The locale property affects only the UI elements and not your data or the metadata language.

## Supported events

`gd-insight` emits the following events:

* `error` - an error occurred while evaluating the data for the visualization.
* `exportReady` - a user requested the export and it is ready.
* `loadingChanged` - loading state of the visualization has changed.
* `insightLoaded` - visualization data is fully loaded.

Events **do not bubble** and **are not cancelable**. For more info on the event payload, see the callback description of
[the InsightView component][3].

You can subscribe to the events the same way as to any other DOM event:

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

[1]:https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts
[2]:../authentication/
[3]:https://www.gooddata.com/docs/gooddata-ui/latest/learn/visualize_data/insightview#properties
