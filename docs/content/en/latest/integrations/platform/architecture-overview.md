---
legacy_path: architecture/architecture_overview
title: Architecture overview
description: How GoodData.UI's layered architecture and the Analytical Backend Service Provider Interface let you build backend-agnostic analytics applications.
category: Integrations / Platform
diataxis_type: explanation
related_pages:
  - /docs/integrations/platform/limitations
  - /docs/integrations/platform/compatibility
  - /docs/integrations/platform/api-maturity
  - /docs/integrations/platform/esm-only
  - /docs/integrations/backend-setup
type: docs
weight: 100
section: Integrations
subsection: Platform
aliases:
  - "../../architecture/"
  - "../../architecture/architecture_overview/"
---

GoodData.UI follows the principles of layered architecture and draws a clean line between the UI components and the backend server that calculates the data to render. The UI components integrate with a backend server through an interface called the **Analytical Backend**.

The **Analytical Backend** is designed as a Service Provider Interface (SPI) with clearly defined contracts that you can implement to work even with your own arbitrary backend. For now, the full documentation of the SPI is provided only at the code level — see the `@gooddata/sdk-backend-spi` package.

GoodData.UI comes with a full implementation of the Analytical Backend SPI for [GoodData Cloud](https://www.gooddata.ai/docs/cloud/) and [GoodData.CN](https://www.gooddata.ai/docs/cloud-native/latest/). GoodData.UI uses the **tiger** codename for these two GoodData products in all developer-facing artifacts and APIs. A codename outlasts product renames.

{{% alert color="info" title="GoodData Legacy" %}}
GoodData Legacy uses the **bear** codename in all developer-facing artifacts and APIs. This codename can only be found in GoodData.UI versions 9.x and lower. GoodData Legacy is no longer supported by GoodData.UI version 10 or newer.
{{% /alert %}}

The **Analytical Backend** abstraction ultimately allows you to develop applications that can be backend-agnostic.

## Packages

GoodData.UI is published as a set of focused [npm packages](https://www.npmjs.com/org/gooddata) under the `@gooddata` scope. They are grouped below by the role each plays in the architecture.

### Backend

| Package | Contents |
| :--- | :--- |
| `@gooddata/sdk-backend-spi` | The Analytical Backend SPI — the abstraction interfaces you implement to integrate any backend |
| `@gooddata/sdk-backend-tiger` | The Analytical Backend implementation for GoodData Cloud and GoodData.CN |
| `@gooddata/api-client-tiger` | The REST API client for GoodData Cloud and GoodData.CN |

### Model

| Package | Contents |
| :--- | :--- |
| `@gooddata/sdk-model` | The APIs and models used to construct inputs to executions and charts |

### React UI components

| Package | Contents |
| :--- | :--- |
| `@gooddata/sdk-ui` | The React infrastructure and headless components such as the Execute component |
| `@gooddata/sdk-ui-charts` | The React components for all charts, plus the `Repeater` |
| `@gooddata/sdk-ui-geo` | The React components for geo charts: `GeoPushpinChart` and `GeoAreaChart` |
| `@gooddata/sdk-ui-pivot` | The React components for the pivot table: `PivotTable` and `PivotTableNext` |
| `@gooddata/sdk-ui-filters` | The filtering components |
| `@gooddata/sdk-ui-ext` | The components for rendering visualizations saved in your workspace, including `InsightView` |
| `@gooddata/sdk-ui-dashboard` | The Dashboard component and its plugin API |
| `@gooddata/sdk-ui-loaders` | Runtime component loaders, including the plugin-enabled dashboard loader |
| `@gooddata/sdk-ui-kit` | Shared UI building-block components used across the SDK |
| `@gooddata/sdk-ui-theme-provider` | The `ThemeProvider` component and theming support |
| `@gooddata/sdk-ui-vis-commons` | Shared visualization utilities (colors, legends, config) used by the chart packages |
| `@gooddata/sdk-ui-web-components` | Web Components (custom elements) that wrap GoodData.UI; distributed as a bundle rather than an npm install |
| `@gooddata/sdk-ui-gen-ai` | The GenAI components, including the AI Assistant |
| `@gooddata/sdk-ui-semantic-search` | The semantic search components |
| `@gooddata/sdk-ui-application-header` | Application header components — workspace picker and notifications dropdown |
| `@gooddata/sdk-ui-catalog` | The Analytics Catalog components |
| `@gooddata/sdk-ui-all` | An umbrella package that re-exports the public API of `@gooddata/sdk-model`, `@gooddata/sdk-backend-spi`, `@gooddata/sdk-ui`, and the charts, geo, pivot, filters, and ext packages |

### Embedding

| Package | Contents |
| :--- | :--- |
| `@gooddata/sdk-embedding` | APIs for embedding GoodData content and communicating with it |

### Tooling

| Package | Contents |
| :--- | :--- |
| `@gooddata/app-toolkit` | A CLI for creating and maintaining GoodData web applications |
| `@gooddata/catalog-export` | Exports a workspace's catalog of attributes and measures into code for type-safe references |
| `@gooddata/plugin-toolkit` | Tools for creating and managing dashboard plugins |

For the full list of public exports per package, see the [API Reference](../../../api-reference/).

## Module format

The SDK ships as ES modules only — one build per package, with no parallel CommonJS output. A single module format means a single module graph, so your bundler sees every `@gooddata` import as the same kind of module and can shake unused code out of a package as large as `@gooddata/sdk-ui-dashboard`. It also removes the dual-package hazard, where a CommonJS and an ESM copy of the same package load side by side and their singletons stop matching.

The cost is that your toolchain has to resolve ES modules and the `exports` field. See [ESM-only distribution](../esm-only/) for what each package exposes, the bundler, TypeScript, and Node requirements, and fixes for the common CommonJS errors.

## Limitations

GoodData Cloud and GoodData.CN do not yet implement every capability specified on the Analytical Backend SPI. Before you rely on a given feature, review the [Limitations](../limitations/) page for the list of unsupported capabilities and the entity-referencing rules that affect GoodData.UI components.
