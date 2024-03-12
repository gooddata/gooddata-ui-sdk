---
title: "Embed Dashboards"
linkTitle: "Embed Dashboards"
icon: "embed.svg"
weight: 70
no_list: true
---

GoodData.UI offers the following methods of building and embedding dashboards:

- Using the [KPI Dashboards](#kpi-dashboards)
- Using the [Dashboard component](#dashboard-component)
- Building [custom dashboards](#custom-dashboards)

Each method has its advantages and disadvantages.

This article explains how these methods differ and helps you decide which method is the most appropriate for your particular use case.

The methods are described from the simplest to the most complex. As a general rule, whenever possible, choose a simpler method this is sufficient for satisfying your needs over a more complex method that may require more code or special skills to implement.

## KPI Dashboards

KPI Dashboards is an end-to-end dashboard solution that covers both creation and consumption of dashboards. KPI Dashboards offer many features out of the box such as filtering, drilling, sharing, responsive layout, theming, email scheduling, export, and embedding.

Users can build new dashboards and edit the existing ones in a friendly drag-and-drop user interface.

With the KPI Dashboards, you have the following options:

- Embed KPI Dashboards in your application via an [iframe](#embed-a-kpi-dashboard-via-an-iframe).

- Extend the default functionality with the [dashboard plugins](#add-the-dashboard-plugins-to-a-kpi-dashboard).

### Embed a KPI Dashboard via an iframe

Embedding a KPI Dashboard via an iframe allows you to easily integrate the KPI Dashboard in your application or an HTML page.
For more information, see [Embed Dashboards](https://help.gooddata.com/pages/viewpage.action?pageId=81962320).

**Advantages:**
- Basic customization options via query parameters (for example, hide the filter bar)
- Support for the [dashboard plugins](#add-the-dashboard-plugins-to-a-kpi-dashboard)
- Communication via the [postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

**Disadvantages:**
- Limited customization options comparing to the [Dashboard component](#dashboard-component)

### Add the dashboard plugins to a KPI Dashboard

The dashboard plugins allow you to enhance the KPI Dashboards experience with third-party libraries, and custom visualizations and behavior.
With the dashboard plugins, you can run your own code within the KPI Dashboards. For more information, see [Dashboard Plugins](../../references/dashboard_component/dashboard_plugins/).

**Advantages:**
- Stable APIs that support GoodData Cloud and GoodData.CN
- A [CLI tool](../../references/dashboard_component/dashboard_plugins/#getting-started) available as part of the Plugin Development Toolkit
- Support for TypeScript

**Disadvantages:**
- Limited customization options comparing to the [Dashboard component](../../references/dashboard_component/)

## Dashboard component

The Dashboard component is a highly customizable React component that renders dashboards created and saved by KPI Dashboards. In essence, the Dashboard component is an engine that the KPI Dashboards use in the background.

The Dashboard component provides many built-in features. For more information, see [Introduction to the Dashboard Component](../../references/dashboard_component/).

**Advantages:**
- Seamless and deep integration with React applications with a wide range of options (eventing API, customizations)
- Extensive customization options such as custom visualization types, integration of third-party libraries, [dashboard plugins](#add-the-dashboard-plugins-to-a-kpi-dashboard) and so on
- APIs that support GoodData Cloud and GoodData.CN
- Support for TypeScript

**Disadvantages:**
- Some customization options at alpha or beta stage
- Limited styling or layout customization options comparing to the [custom dashboards](#custom-dashboards)

## Custom dashboards

If none of the methods described in this article satisfies your needs, GoodData.UI allows you to create your own dashboard.
This is the most involved method of building dashboards, but it offers the most flexibility.

**Advantages:**
- Everything under your control (custom visualization types, custom layout, styling and so on)
- The core `sdk-model` and `sdk-backend-*` packages compatible with any JavaScript/TypeScript framework
- Multiple ready-to-use React components and hooks, both high- and low-level: [charts](../../references/visual_components/), contexts, and much more ...
- The deepest integration with your application with a wide range of options
- APIs that support GoodData Cloud and GoodData.CN

**Disadvantages:**
- More time needed for development and maintenance comparing to the other methods
- Deeper knowledge of GoodData required comparing to the other methods
- More complex (but not impossible) integration with applications without React