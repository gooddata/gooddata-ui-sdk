---
title: Dashboard custom element
sidebar_label: Dashboard custom element
copyright: (C) 2007-2022 GoodData Corporation
id: webcomponents_dashboard
---

You can embed a view-only GoodData dashboard into your application using the `gd-dashboard` custom element with the following:

```html
<!-- minimal setup -->
<gd-dashboard dashboard="my-dashboard-id"></gd-dashboard>
```

## Supported attributes

```html
<!-- all supported attributes -->
<gd-dashboard
    dashboard="my-dashboard-id"
    workspace="my-workspace-id"
    locale="en_US"
    readonly
></gd-dashboard>
```

* `dashboard` - Mandatory, the ID of the dashboard to embed.
* `workspace` - optional, the ID of the workspace for this dashboard. By default, it is taken from the context (e.g., from the script URL).
* `locale` - optional, defaults to `en-US`. The localization of the visualization. For all available languages, see [the full list of available localizations][1].
* `readonly` - optional. If enabled, the dashboard will be embedded in the read-only mode and all user interaction that would alter any backend state will be disabled (e.g., creating/changing alerts, creating scheduled emails, and so on).

You can also provide a workspace id on the context level instead of passing it as an attribute to every dashboard. See the code example of the [Web Components authentication][2] article.

> The locale property affects only the UI elements and not your data or the metadata language.

## Supported events

`gd-dashboard` emits [the same events as the Dashboard component][3].

Events **do not bubble** and **are not cancelable**. Here is how you can subscribe to one from your code:

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

[1]:https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts
[2]:../authentication/
[3]:https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.dashboardeventtype.html