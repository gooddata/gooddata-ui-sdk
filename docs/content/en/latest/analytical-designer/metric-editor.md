---
title: Metric editor
description: How users create and edit metrics in Analytical Designer, who can do it, and how your application keeps its data fresh afterwards.
diataxis_type: explanation
type: docs
weight: 5
api_symbols:
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerCacheReset"
source_files:
  - src/components/MetricEditorDialog.tsx
  - src/components/catalog/blocks/CreateMetricButton.tsx
  - src/selectors/metric_permissions_selector.ts
related_pages:
  - /docs/analytical-designer/handle-analytical-designer-events
  - /docs/analytical-designer/embed-analytical-designer
  - /docs/dashboard-plugins/edit-visualizations-on-dashboard
section: Analytical Designer
category: Analytical Designer
ai_generated_body: true
---

Analytical Designer includes the metric editor of GoodData Cloud. Users create and change metrics, written in MAQL, while they build a visualization. They don't have to leave Analytical Designer or your application. The editor comes with the `AnalyticalDesigner` component, both standalone and when the [Dashboard component opens it](../../dashboard-plugins/edit-visualizations-on-dashboard/), and needs no setup.

## Where it appears

- **Create metric** at the top of the catalog opens the editor for a new metric. The button is disabled while the workspace has no data.
- The details of a metric in the catalog have an **Edit** button, or a **View** button when the user can't edit the metric.

The editor opens as a panel over Analytical Designer. It keeps each metric in its own tab, so the user can work on several metrics at once. The user can minimize the panel and go back to the visualization. If the user leaves Analytical Designer with unsaved metric changes, Analytical Designer asks for confirmation first.

## Who can create and edit metrics

The rules follow the `enableMetricPermissions` setting of the workspace:

| | `enableMetricPermissions` off | `enableMetricPermissions` on |
| --- | --- | --- |
| Create a metric | Users with the workspace `MANAGE` permission | Users with the `canCreateMetric` workspace permission |
| Edit a metric | Users with the workspace `MANAGE` permission | Users with `MANAGE`, or with `EDIT` on that metric |

Everyone else opens metrics read-only, through **View**.

## What changes for your application

A saved or deleted metric changes data that your application may have cached:

- `AnalyticalDesigner` calls `cacheReset.resetAll` before it reloads its own data, and emits the `metricsChanged` event. Pass `cacheReset` when your backend caches, and use `metricsChanged` in `onEvent` to refresh the rest of your application. See [Keep a shared cache fresh](../handle-analytical-designer-events/#keep-a-shared-cache-fresh).
- In the Dashboard component, the same moment emits `GDC.DASH/EVT.INSIGHT_EDITOR.CACHE_RESET_REQUESTED` with the scope `"all"`. See [Keep a caching backend fresh](../../dashboard-plugins/edit-visualizations-on-dashboard/#keep-a-caching-backend-fresh).

The MAQL editor runs part of its work in a web worker. The worker ships bundled with the package, so it needs no bundler configuration.
