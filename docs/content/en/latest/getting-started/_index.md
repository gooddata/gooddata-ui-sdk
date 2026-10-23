---
legacy_path: introduction
title: Getting started
weight: 10
description: GoodData.UI is the official React SDK for embedding GoodData
  analytics, from single charts and filters to whole dashboards and the AI
  assistant, directly into your application.
diataxis_type: explanation
ai_generated_body: true
type: docs
aliases:
  - "introduction/"
  - "learn/"
---

GoodData.UI talks to [GoodData Cloud and GoodData.CN](https://www.gooddata.ai/) over the analytical backend API and ships as a set of npm packages under the `@gooddata/*` scope. The SDK is written for React. If your app is Angular, Vue, or plain HTML, the same components are available as [Web Components](../integrations/web-components/).

If you only need a saved dashboard inside an existing page and don't want to install any SDK code, you can [embed a dashboard in an iframe](https://www.gooddata.ai/docs/cloud/embed-visualizations/iframes/). That works in any framework with no code at all. You can hide parts of the dashboard through URL query parameters (the filter bar, for example) and talk to it from the host page over [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage). Reach for the React SDK or Web Components when you need more than that: your own layout, control over single widgets, state shared between components, or raw data in your own UI.

## See a chart in five minutes

One command scaffolds a React app that already talks to a public demo workspace. The dev server proxies the API, so you don't set up CORS or sign in to anything:

```bash
npx @gooddata/app-toolkit@latest init my-analytics-app
```

The [Quick start](quickstart/) explains what the command creates and how to swap the sample chart for a dashboard, or for a chart you define in code. It ends with the app pointed at your own workspace.

To add GoodData.UI to a React codebase you already have instead, see [Add GoodData.UI to an existing React app](installation/).

Before you start, check your toolchain. [Platform compatibility](platform-compatibility/) lists the Node.js, React, TypeScript, and bundler versions you need, and which SDK major works with which GoodData platform.

## Core concepts

A GoodData.UI application is built from a small set of primitives. You rarely need all of them at once, so pick what fits the screen you are building.

**Backend and workspace context.** Every app is wrapped in a `BackendProvider` and `WorkspaceProvider`. The backend object knows how to authenticate and talk to your GoodData instance. The workspace identifies which workspace's data you are rendering. Everything downstream, whether a chart, a filter, a dashboard, or a raw execution, reads both through React context, so you configure them once at the root. Configure them as described in [Integrations](../integrations/).

**Visualizations.** A broad chart library: bar, column, line, area, pie, scatter, heatmap, funnel, waterfall, bullet, treemap, sankey, geo, and more, plus a pivot table and a repeater for tabular output. You can build charts in code by passing `measures`, `viewBy`, and `stackBy` props, or render any saved visualization by identifier with the universal `InsightView` component. Every chart shares one chart-config object for colors, legends, axes, and labels. See [Visualizations](../visualisations/).

**Dashboards and plugins.** A full GoodData dashboard, with its layout, filters, widgets, and cross-filtering, drops into your app as a single `Dashboard` component. For deeper integration, a plugin system lets you register custom widgets, replace built-in rendering, intercept drills, dispatch commands, and react to events. A full set of React hooks exposes the underlying Redux state machine for plugin authors. See [Dashboard & plugins](../dashboard-plugins/).

**Filters.** The SDK ships ready-to-use React components for four filter types: attribute (single- and multi-select), date (absolute, relative, presets), measure-value, and ranking. Attribute filters also come as headless hooks, so you can build a custom UI while reusing the SDK's loading, paging, and selection logic. See [Filters](../filters/).

**Data layer.** When a ready-made chart is not enough, the data layer gives you the raw data. `Execute`, `RawExecute`, and `ExecuteInsight` are render-prop components that run analytics queries; hooks such as `useExecutionDataView` and `useInsightDataView` expose the same power to function components. The data model covers measures, attributes, and a generated metadata catalog that gives you typed references to workspace objects. See [Data layer](../data-layer/).

**AI and high-level modules.** Ready-made product surfaces built on top of the SDK: an AI Assistant for conversational analytics, Semantic Search for meaning-based discovery, the Analytics Catalog explorer, and a Notifications panel for alerts. See [AI & modules](../ai-modules/).

**Integrations.** Everything that sits between the SDK and your app shell: authentication, cross-origin setup, theming, drilling and interactivity, Angular and Vue adapters, and context hooks for reading backend, workspace, organization, and theme from any component. See [Integrations](../integrations/).

## Building with an AI coding assistant?

This documentation is also published as Markdown for tools such as Cursor, GitHub Copilot, or Claude. Point your assistant at [llms.txt](../../llms.txt), the index of every page. The [LLMs](llms/) page has the details.

To let the assistant work with your GoodData workspace itself, connect it to the GoodData MCP server. The [LLMs](llms/#give-the-assistant-access-to-your-workspace) page links the setup.
