---
title: Edit visualizations on a dashboard
description: Let users explore, edit, and create visualizations in Analytical Designer on top of the Dashboard component with the enableInsightEditing option.
diataxis_type: howto
type: docs
weight: 29
api_symbols:
  - "@gooddata/sdk-ui-dashboard:DashboardConfig"
  - "@gooddata/sdk-ui-dashboard:InsightEditorTarget"
  - "@gooddata/sdk-ui-dashboard:IDashboardInsightEditorInsightSaved"
  - "@gooddata/sdk-ui-dashboard:IDashboardInsightEditorCacheResetRequested"
source_files:
  - src/presentation/insightEditor/InsightEditorOverlay.tsx
  - src/presentation/insightEditor/InsightEditorContent.tsx
  - src/presentation/insightEditor/insightEditorRoute.ts
  - src/presentation/insightEditor/useInsightEditorSession.ts
  - src/presentation/insightEditor/useInsightEditorMenuItems.tsx
  - src/presentation/insightEditor/useExploreFilterTransfer.ts
  - src/model/events/insightEditor.ts
related_pages:
  - /docs/dashboard-plugins/dashboard
  - /docs/analytical-designer
  - /docs/analytical-designer/metric-editor
  - /docs/dashboard-plugins/dashboard-performance
  - /docs/dashboard-plugins/dashboard-events
section: Dashboard & plugins
category: Dashboard & plugins
ai_generated_body: true
---

When you finish, users of your embedded dashboard open [Analytical Designer](../../analytical-designer/) on top of the dashboard. They can explore a visualization in view mode, edit it in edit mode, or create a new one, for example by dragging it into the layout. They stay in your application the whole time.

## Turn on visualization editing

Set `enableInsightEditing` in the `config` of the `Dashboard` component:

```tsx
import "@gooddata/sdk-ui-dashboard/styles/css/main.css";

import { Dashboard } from "@gooddata/sdk-ui-dashboard";
import { idRef } from "@gooddata/sdk-model";

const dashboardRef = idRef("<dashboard-identifier>");

export const EditableDashboard = () => (
    <Dashboard dashboard={dashboardRef} config={{ enableInsightEditing: true }} />
);
```

{{% alert color="warning" title="Alpha API" %}}
`enableInsightEditing`, the editor events, and `selectInsightEditorTarget` are `@alpha`: they can change outside of the usual SemVer guarantees. See [API maturity](../../integrations/platform/api-maturity/).
{{% /alert %}}

The option defaults to `false`. With it off, the dashboard behaves as before.

You don't install or import anything else. `@gooddata/sdk-ui-analytical-designer` is a dependency of `@gooddata/sdk-ui-dashboard`. The dashboard loads Analytical Designer and its stylesheets in a separate chunk the first time a user opens it. It also passes Analytical Designer the data it has already loaded: backend, workspace, settings, permissions, user, color palette, theme, and the catalog tags of `objectAvailability`. Analytical Designer opens without loading them again.

## Where users open Analytical Designer

Each entry point appears only for users with the matching permission:

| Entry point | Mode | Shown when | What opens |
| --- | --- | --- | --- |
| **Explore from here** in the widget menu | View | The user can create visualizations. | An unsaved copy of the widget's visualization, with the dashboard filters |
| **Edit** in the widget menu | Edit | The user can edit the visualization: the workspace `MANAGE` permission, or `EDIT` on the visualization when visualization permissions are on. | The widget's visualization |
| **Visualization** in the creation panel | Edit | The user can create visualizations, and the `enableKPIDashboardNewInsight` setting is not `false`. | An empty editor for the dropped placeholder |
| The create button of the empty visualization list | Edit | The user can create visualizations. | An empty editor |

Analytical Designer has no mobile layout, so these entry points don't open it on a mobile screen.

### Drag a new visualization into the layout

In edit mode, the creation panel has a **Visualization** item. When the user drags it into the layout, a placeholder takes the drop position and Analytical Designer opens with an empty editor. Saving puts the new visualization at the position of the placeholder. Cancelling removes the placeholder.

## What saving does

| Flow | Save | Header actions |
| --- | --- | --- |
| Edit | Saves the visualization in place. The widget shows the new version. When the visualization type changes, or the visualization is a table, the widget size resets. | **Open**, **Clear**, and **Export** are hidden. **Save as** is hidden when the user can't create visualizations. **Save** is hidden on a locked visualization, unless the user can manage the workspace. |
| Explore | Saves the copy as a new visualization. The dashboard doesn't change. | **Save as** is hidden. |
| New, from the creation panel | Saves the visualization and puts it into the placeholder. | **Open**, **Export**, and **Save as** are hidden. **Cancel** is shown. |
| New, from the visualization list | Saves the visualization. It appears in the visualization list, and the user adds it to the layout from there. | **Open**, **Export**, and **Save as** are hidden. **Cancel** is shown. |

When a visualization is saved but cannot be added to the dashboard, the dashboard shows a message and removes the placeholder. The visualization stays saved.

Escape closes the topmost layer first, for example an open dropdown. When Escape or a click outside reaches the editor itself, Analytical Designer closes. If the user has unsaved changes in an edited visualization or a metric, it asks for confirmation first.

## Explore with the dashboard filters

**Explore from here** passes the dashboard filters and the timezone of the widget to Analytical Designer, so the copy shows the same data as the widget. Filters on attributes that cannot filter the visualization don't pass.

When the filters cannot be kept, the dashboard shows a warning, and the copy opens without them:

- The date filter of the dashboard cannot be applied to the visualization.
- The filters have more than 20 items.
- Passing the filters takes longer than five seconds, or fails.

## React to the editor events

The dashboard emits these events. Each has a type guard, for example `isDashboardInsightEditorInsightSaved`:

| Event | When |
| --- | --- |
| `GDC.DASH/EVT.INSIGHT_EDITOR.OPENED` | Analytical Designer opens. The payload has the `InsightEditorTarget`: a widget, a visualization, a placeholder, or a new visualization. |
| `GDC.DASH/EVT.INSIGHT_EDITOR.INSIGHT_SAVED` | The user saves the visualization. The payload has the target and the saved `IInsight`. The editor closes. |
| `GDC.DASH/EVT.INSIGHT_EDITOR.CANCELLED` | The user leaves without saving. The editor closes. |
| `GDC.DASH/EVT.INSIGHT_EDITOR.CACHE_RESET_REQUESTED` | Analytical Designer needs fresh data from a caching backend. See the next section. |

```tsx
import {
    Dashboard,
    type IDashboardInsightEditorInsightSaved,
    isDashboardInsightEditorInsightSaved,
} from "@gooddata/sdk-ui-dashboard";

<Dashboard
    dashboard={dashboardRef}
    config={{ enableInsightEditing: true }}
    eventHandlers={[
        {
            eval: isDashboardInsightEditorInsightSaved,
            handler: (event: IDashboardInsightEditorInsightSaved) => {
                console.log("Visualization saved", event.payload.insight);
            },
        },
    ]}
/>;
```

To read whether the editor is open, and for which target, use `selectInsightEditorTarget`. See [Handle dashboard events](../dashboard-events/) for more about event handlers.

## Keep a caching backend fresh

If you give the dashboard a backend wrapped with `withCaching`, reset its caches when Analytical Designer asks. It asks after the user refreshes the catalog, edits a metric, or changes an attribute hierarchy. `payload.scope` is `"catalogs"` or `"all"`:

```tsx
import {
    Dashboard,
    type IDashboardInsightEditorCacheResetRequested,
    isDashboardInsightEditorCacheResetRequested,
} from "@gooddata/sdk-ui-dashboard";

import { cacheControl } from "./backend.js";

<Dashboard
    dashboard={dashboardRef}
    config={{ enableInsightEditing: true }}
    eventHandlers={[
        {
            eval: isDashboardInsightEditorCacheResetRequested,
            handler: (event: IDashboardInsightEditorCacheResetRequested) => {
                if (event.payload.scope === "all") {
                    cacheControl?.resetAll();
                } else {
                    cacheControl?.resetCatalogs();
                }
            },
        },
    ]}
/>;
```

[Improve dashboard performance](../dashboard-performance/#invalidate-the-cache-after-a-write) shows how to get `cacheControl` from `withCaching`.

{{% alert color="warning" title="One Analytical Designer per page" %}}
Only one Analytical Designer can be mounted on a page. Don't render a standalone `AnalyticalDesigner` while the dashboard editor can open.
{{% /alert %}}
