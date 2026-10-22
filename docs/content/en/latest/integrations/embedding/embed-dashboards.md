---
legacy_path: learn/embed_dashboards/embed_dashboards
title: Embed dashboards
category: Integrations / Embedding
diataxis_type: explanation
api_symbols:
  - "@gooddata/sdk-ui-dashboard:Dashboard"
source_files:
  - src/presentation/dashboard/Dashboard.tsx
props_interfaces:
  - IDashboardProps
  - IDashboardBaseProps
  - IDashboardExtensionProps
  - IDashboardEventing
  - IDashboardCustomizationProps
  - IDashboardCustomComponentProps
  - IDashboardWidgetsOverlayProps
  - IDashboardThemingProps
related_pages:
  - /docs/dashboard-plugins/dashboard
  - /docs/dashboard-plugins/embed-dashboard-with-plugins
  - /docs/integrations/web-components/dashboard-custom-element
  - /docs/integrations/embedding/embed-visualizations
  - /docs/integrations/web-components/embed-custom-elements
type: docs
description: Choose among a built-in dashboard embedded through an iframe, the Dashboard component, and a custom dashboard by comparing their integration, customization, and implementation trade-offs.
weight: 77
section: Integrations
subsection: Embedding
aliases:
  - "../../learn/embed_dashboards/embed_dashboards/"
---

GoodData.UI offers the following methods of building and embedding dashboards:

- Embedding the [built-in dashboards](#built-in-dashboards)
- Using the [Dashboard component](#dashboard-component)
- Building [custom dashboards](#custom-dashboards)

Each method has its advantages and disadvantages.

This page explains how these methods differ, so you can pick the one that fits your use case.

The methods are described from the simplest to the most complex. As a general rule, choose the simplest method that satisfies your needs over a more complex one that requires more code or special skills to implement.

## Built-in dashboards

The dashboards built into GoodData Cloud and GoodData.CN are an end-to-end solution that covers both creation and consumption of dashboards. They offer many features out of the box, such as filtering, drilling, sharing, responsive layout, theming, email scheduling, export, and embedding.

Users build new dashboards and edit existing ones in a drag-and-drop user interface.

With the built-in dashboards, you have the following options:

- Embed a dashboard in your application via an [iframe](#embed-a-dashboard-via-an-iframe).

- Extend the default functionality with [dashboard plugins](#add-dashboard-plugins-to-a-dashboard).

### Embed a dashboard via an iframe

Embedding a dashboard via an iframe lets you integrate it in your application or an HTML page without any SDK code.
For more information, see [Embed a dashboard via an iframe](https://www.gooddata.ai/docs/cloud/embed-visualizations/iframes/).

Advantages:
- Basic customization options via query parameters (for example, hide the filter bar)
- Support for [dashboard plugins](#add-dashboard-plugins-to-a-dashboard)
- Communication via the [postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

Disadvantages:
- Limited customization options compared to the [Dashboard component](#dashboard-component)

### Add dashboard plugins to a dashboard

Dashboard plugins let you enhance the built-in dashboards with third-party libraries, custom visualizations, and custom behavior.
With dashboard plugins, you run your own code within the dashboard. For more information, see [Dashboard plugins](../../../dashboard-plugins/dashboard-plugins/).

Advantages:
- Stable APIs that support GoodData Cloud and GoodData.CN
- A [CLI tool](../../../dashboard-plugins/develop-your-first-plugin/) (`@gooddata/plugin-toolkit`) that scaffolds, builds, and links plugins
- Support for TypeScript

Disadvantages:
- Limited customization options compared to the Dashboard component

## Dashboard component

The `Dashboard` component from `@gooddata/sdk-ui-dashboard` is a React component that renders dashboards created and saved in the built-in dashboards. It is the engine that the built-in dashboards use in the background, and you can customize it extensively.

The `Dashboard` component provides many built-in features. See [Dashboard component](../../../dashboard-plugins/dashboard/), which also lists its props.
On its own, the component does not load the plugins linked to a dashboard. To render a dashboard together with its plugins, load it with `useDashboardLoader` as described in [Embed a dashboard with plugins](../../../dashboard-plugins/embed-dashboard-with-plugins/).

Advantages:
- Deep integration with React applications with a wide range of options (eventing API, customizations)
- Extensive customization options such as custom visualization types, integration of third-party libraries, [dashboard plugins](#add-dashboard-plugins-to-a-dashboard), and so on
- APIs that support GoodData Cloud and GoodData.CN
- Support for TypeScript

Disadvantages:
- Some customization options are at alpha or beta stage
- Limited styling or layout customization options compared to [custom dashboards](#custom-dashboards)

## Custom dashboards

If none of the methods above satisfies your needs, GoodData.UI lets you create your own dashboard.
This is the most involved method of building dashboards, but it offers the most flexibility.

Advantages:
- Everything under your control (custom visualization types, custom layout, styling and so on)
- The core `sdk-model` and `sdk-backend-*` packages compatible with any JavaScript/TypeScript framework
- Multiple ready-to-use React components and hooks, both high- and low-level: charts, contexts, and more
- The deepest integration with your application with a wide range of options
- APIs that support GoodData Cloud and GoodData.CN

Disadvantages:
- More time needed for development and maintenance compared to the other methods
- Deeper knowledge of GoodData required compared to the other methods
- More complex (but not impossible) integration with applications without React

