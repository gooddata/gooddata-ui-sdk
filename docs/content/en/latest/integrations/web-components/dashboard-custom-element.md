---
legacy_path: learn/web_components/dashboard_custom_element
title: Dashboard custom element
category: Integrations / Web Components
diataxis_type: reference
related_pages:
  - /docs/integrations/web-components/embed-custom-elements
  - /docs/integrations/web-components/web-components-overview
  - /docs/integrations/web-components/web-components-auth
  - /docs/dashboard-plugins/dashboard
  - /docs/integrations/web-components/insight-custom-element
description: Embed a dashboard with gd-dashboard, configure its workspace, locale, and read-only mode, and subscribe to dashboard events.
ai_generated_description: true
type: docs
weight: 82
section: Integrations
subsection: Web Components
aliases:
  - "../../learn/web_components/dashboard_custom_element/"
---

{{% alert color="info" title="Legacy element" %}}
`gd-dashboard` is the legacy dashboard element, kept for existing integrations. For new integrations, use `gd-dashboard-embed`, which adds JavaScript properties, the `refresh()` and `replaceFilters()` methods, dashboard plugin loading, and the `gd-ready` and `gd-error` events. See [Dashboard and visualization embed elements](../embed-custom-elements/).
{{% /alert %}}

`gd-dashboard` embeds a GoodData dashboard. It renders the [`Dashboard` component](../../../dashboard-plugins/dashboard/):

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
    locale="en-US"
    readonly
    mapbox="my-mapbox-token"
    agGrid="my-ag-grid-license-key"
></gd-dashboard>
```

- `dashboard` - required, the ID of the dashboard to embed.
- `workspace` - optional, the ID of the workspace for this dashboard. By default, it's taken from the context, for example from the script URL.
- `locale` - optional, defaults to `en-US`. The localization of the dashboard UI. Use the hyphenated form (`en-US`, `de-DE`); an unknown value falls back to `en-US`. For all available languages, see [the full list of available localizations][1].
- `readonly` - optional. If enabled, the dashboard is embedded in read-only mode and all user interaction that would alter any backend state is disabled (for example, creating or changing alerts and scheduled emails).
- `mapbox` - optional, a Mapbox access token used by geo charts on the dashboard. Overrides the `mapboxToken` from the context.
- `agGrid` - optional, an AG Grid license key used by pivot tables on the dashboard. Overrides the `agGridToken` from the context.

You can also set the workspace ID once on the context instead of passing it to every element. See the code example in [Web Components authentication][2].

{{% alert color="info" %}}
The locale affects only the UI elements, not your data or the metadata language.
{{% /alert %}}

## Supported events

`gd-dashboard` forwards every event the `Dashboard` component emits as a DOM event named after the event type (see `DashboardEventType`), for example `GDC.DASH/EVT.INITIALIZED`.

Events don't bubble and aren't cancelable. Subscribe to them as to any other DOM event:

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

[1]: https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-model/src/base/localization.ts
[2]: ../web-components-auth/

