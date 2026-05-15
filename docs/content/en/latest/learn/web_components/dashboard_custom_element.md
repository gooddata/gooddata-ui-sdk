---
title: Dashboard custom element
sidebar_label: Dashboard custom element
copyright: (C) 2007-2022 GoodData Corporation
id: webcomponents_dashboard
---

For new integrations, embed dashboards using the `gd-dashboard-embed` custom element.
The legacy `gd-dashboard` tag remains available for existing integrations that depend on the original
attribute-driven custom element behavior.

```html
<!-- minimal setup -->
<gd-dashboard-embed dashboard="my-dashboard-id"></gd-dashboard-embed>
```

## Primary embed runtime

`gd-dashboard-embed` is the recommended dashboard embed runtime for new integrations. It exposes the current
property-first API, lifecycle events, dashboard command methods, and explicit plugin loading modes.

## Supported attributes

```html
<!-- all supported attributes -->
<gd-dashboard-embed
    dashboard="my-dashboard-id"
    workspace="my-workspace-id"
    locale="en_US"
    readonly
></gd-dashboard-embed>
```

- `dashboard` - Mandatory, the ID of the dashboard to embed.
- `workspace` - optional, the ID of the workspace for this dashboard. By default, it is taken from the context (e.g., from the script URL).
- `locale` - optional, defaults to `en-US`. The localization of the visualization. For all available languages, see [the full list of available localizations][1].
- `readonly` - optional. If enabled, the dashboard will be embedded in the read-only mode and all user interaction that would alter any backend state will be disabled (e.g., creating/changing alerts, creating scheduled emails, and so on).

You can also provide a workspace id on the context level instead of passing it as an attribute to every dashboard. See the code example of the [Web Components authentication][2] article.

> The locale property affects only the UI elements and not your data or the metadata language.

## Supported events

`gd-dashboard-embed` emits [the same events as the Dashboard component][3] and also emits `gd-ready` and `gd-error`.

Events **do not bubble** and **are not cancelable**. Here is how you can subscribe to one from your code:

```html
<gd-dashboard-embed dashboard="my-dashboard-id" id="some-dom-id"></gd-dashboard-embed>
<script>
    const dashboardEl = document.getElementById("some-dom-id");
    dashboardEl.addEventListener("GDC.DASH/EVT.INITIALIZED", (event) => {
        // See what's in the event payload
        console.log(event.detail);
    });

    dashboardEl.addEventListener("gd-ready", () => {
        console.log("dashboard ready");
    });
</script>
```

## Legacy compatibility tag

`gd-dashboard` remains available for older integrations that are centered around attribute-driven updates and
expect the original custom element behavior. Prefer `gd-dashboard-embed` for new embedding work; use `gd-dashboard`
only when you need continuity with an existing integration.

[1]: https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui/src/base/localization/Locale.ts
[2]: ../authentication/
[3]: https://sdk.gooddata.com/gooddata-ui-apidocs/docs/sdk-ui-dashboard.dashboardeventtype.html
