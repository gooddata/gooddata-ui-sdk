---
title: useWidgetFilters
category: Dashboard & plugins
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-dashboard:useWidgetFilters"
source_files:
  - src/model/react/useWidgetFilters.ts
related_pages:
  - /docs/dashboard-plugins/use-custom-widget-data-view
  - /docs/filters/inspecting-filters
  - /docs/dashboard-plugins/use-dashboard-selector
  - /docs/dashboard-plugins/customize-widgets
description: Resolve the effective filters of a dashboard widget and visualization, ready to apply with insightSetFilters before execution.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 43
section: Dashboard & plugins
---

`useWidgetFilters` returns the effective filters of a widget: the dashboard filters the widget doesn't ignore, combined with the filters of the visualization. Apply them with `insightSetFilters` from `@gooddata/sdk-model` to get a visualization that is ready for execution, for example in a plugin widget that runs its own execution.

## Basic usage

```tsx
import { type IInsightDefinition, insightSetFilters } from "@gooddata/sdk-model";
import { type FilterableDashboardWidget, useWidgetFilters } from "@gooddata/sdk-ui-dashboard";

export function MyWidgetComponent({
    widget,
    insight,
}: {
    widget: FilterableDashboardWidget;
    insight: IInsightDefinition;
}) {
    const { result: filters, status } = useWidgetFilters(widget, insight);

    if (status === "pending" || status === "running") {
        return <div>Loading filters...</div>;
    }

    if (status === "error" || status === "rejected") {
        return <div>Could not load the filters of this widget.</div>;
    }

    const insightWithFilters = insightSetFilters(insight, filters);
    // Execute insightWithFilters, for example with useExecutionDataView.
    return <div>{insightWithFilters.insight.filters.length} filters applied</div>;
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `widget` | `FilterableDashboardWidget \| undefined \| null` | Widget to get the effective filters for. |
| `insight` | `IInsightDefinition \| undefined` | Optional. Visualization to evaluate the filters for in the context of the widget. When omitted for a visualization widget, the hook uses the visualization the widget links to. |

## Return value

`QueryProcessingState<IFilter[]>`: an object with `status` (`"pending" | "running" | "success" | "error" | "rejected"`), `result`, and `error`. `result` holds the resolved filters when `status` is `"success"`.

| `status` | Meaning |
|----------|---------|
| `"pending"`, `"running"` | The filters are being resolved. Treat as loading. `status` is also `"pending"` right after `widget` changes, so you never get the filters of the previous widget. |
| `"success"` | `result` holds the filters to apply. |
| `"error"`, `"rejected"` | The query failed, for example because the widget is not on the dashboard or the visualization it links to is missing. Show a fallback. |

## Notes

- Narrow on `status` before you use `result`: until `"success"`, it's empty or `undefined`.
- Cross-filtering is honored: when the widget is the *source* of a cross-filter, the attribute filters it introduced are left out of its own effective filters.
- Changing only the selected values of a dashboard filter re-runs less work than adding or removing a filter, or changing the widget's ignore settings.
- In edit mode, attribute filters with nothing selected in a negative selection and "All time" date filters are left out. In view mode they are kept, to prevent flicker when a filter stops being ignored.
- A widget with no `dateDataSet` ignores the common date filter. Date filters with their own dimension are matched by data set.
