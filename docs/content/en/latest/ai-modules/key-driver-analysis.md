---
title: Key Driver Analysis
category: AI & Modules
diataxis_type: explanation
api_symbols:
  - "@gooddata/sdk-ui-gen-ai:GenAiKeyDriverAnalysis"
  - "@gooddata/sdk-ui-gen-ai:GenAiStore"
  - "@gooddata/sdk-ui-gen-ai:useDrillKeyDriverAnalysis"
  - "@gooddata/sdk-ui-gen-ai:IUseDrillKeyDriverAnalysisOptions"
  - "@gooddata/sdk-ui-gen-ai:IUseDrillKeyDriverAnalysisResult"
  - "@gooddata/sdk-ui-dashboard:DashboardEventHandler"
  - "@gooddata/sdk-ui-dashboard:IDashboardKeyDriverAnalysisRequested"
related_pages:
  - /docs/dashboard-plugins/dashboard-events
  - /docs/dashboard-plugins/dashboard
  - /docs/ai-modules/ai-assistant
  - /docs/integrations/interactivity/drillable-items
  - /docs/integrations/platform/api-maturity
type: docs
ai_generated_body: true
description: Enable Key Driver Analysis on custom charts with the beta drill API, understand dashboard eligibility, and observe dashboard analysis events.
weight: 58
section: AI & Modules
---

Key Driver Analysis finds the attribute values that explain a change in a measure between two periods: which regions, products, or channels moved revenue the most, and in which direction. It's a GoodData Cloud feature in beta, described in [Key Driver Analysis](https://www.gooddata.ai/docs/cloud/ai/use-ai_assistant/key-driver-analysis/) in the GoodData Cloud documentation. You can use it in a dashboard, in the AI Assistant, or from a custom chart connected to the `GenAiKeyDriverAnalysis` dialog.

## Where it appears

| Component | How users reach it | What your code can do |
| :-- | :-- | :-- |
| [Dashboard](../../dashboard-plugins/dashboard/) | Click a data point in a visualization and choose **Run Key Driver Analysis** from the drill menu. The dashboard opens the analysis in a dialog. | Listen to the `GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.*` events, see [below](#listen-to-the-analysis-on-a-dashboard). |
| [AI Assistant](../ai-assistant/) | Ask a "why" question, such as "Why did revenue drop last month?", or run the analysis on a visualization the assistant created. The answer renders in the chat. | Mount `GenAiKeyDriverAnalysis` next to the assistant to run the analysis on its charts, see [Key Driver Analysis component](../ai-assistant/#key-driver-analysis-component). |
| Custom chart | Click a data point and choose an **Explain** comparison. | Use the beta chart drill API and a shared dialog, see [the example below](#add-explain-to-a-custom-chart). |

These integrations run the analysis on your GoodData Cloud instance. For custom charts, `useDrillKeyDriverAnalysis` connects a chart drill to the comparison menu and the `GenAiKeyDriverAnalysis` dialog. No separate programmatic opener is exposed. This isn't a headless analysis API: the backend service interface remains `@internal`.

## What a dashboard needs

The Dashboard component adds **Run Key Driver Analysis** to a data point's drill menu on its own, next to the drill-downs and other interactions the dashboard author configured. The entry appears when all of the following hold:

- AI features are enabled for the organization and the workspace, and the user may use the AI Assistant in that workspace. The Dashboard component reads this from the workspace settings it loads at startup.
- The visualization is sliced by exactly one date attribute, with a granularity the analysis supports: year, quarter, month, week, day, hour, or minute.
- The measure is allowed for Key Driver Analysis. Analytics builders can switch it off per measure in the Analytics Catalog (**Use for Key driver analysis**) and per visualization in Analyze. Objects a builder excluded carry `isHiddenFromKda: true` when you read them from the catalog.
- The visualization type supports it. Headlines don't.

The menu offers one entry per comparison the clicked point allows, such as against the previous period or against the same period a year earlier. Which attributes the analysis considers, and how the result is ranked, is configured on the GoodData Cloud side.

## Add Explain to a custom chart

{{% alert color="warning" title="Beta API — target SDK 11.70.0" %}}
This example targets SDK **11.70.0** and is based on the **11.70.0-alpha.0** checkout. This is a release target, not a guarantee that the API is already published or will be backported to earlier versions. The `useDrillKeyDriverAnalysis` hook and its exported `IUseDrillKeyDriverAnalysisOptions` and `IUseDrillKeyDriverAnalysisResult` types are `@beta`.
{{% /alert %}}

Import `useDrillKeyDriverAnalysis` and its options and result types from the `@gooddata/sdk-ui-gen-ai` package root. The hook accepts one `IUseDrillKeyDriverAnalysisOptions` object:

| Option | Type | Purpose |
| :-- | :-- | :-- |
| `insight` | `IInsight` | Required resolved insight. The hook respects its per-measure `disableKeyDriveAnalysisOn` controls. |
| `filters` | `IFilter[]` | Optional complete effective chart filters. When omitted, the hook uses the insight's filters. When supplied, this list replaces that fallback; it isn't merged with the insight's filters. The chart must use the same effective filters. |
| `locale` | `string` | Optional locale for the menu and analysis. |
| `enabled` | `boolean` | Optional application-owned eligibility flag; defaults to `true`. |
| `anchorRef` | `RefObject<HTMLElement \| null>` | Required ref to the chart wrapper used to position the overlay together with the drill coordinates. |
| `enableSecondGranularities` | `boolean` | Optional support for second-level date granularities; defaults to `false`. Enable only when supported by your deployment. |

The returned `IUseDrillKeyDriverAnalysisResult` contains:

| Result | Type | Usage |
| :-- | :-- | :-- |
| `drillableItems` | `IHeaderPredicate[]` | Pass to the chart's `drillableItems` prop. |
| `onDrill` | `(event: IDrillEvent) => void` | Pass to the chart's `onDrill` prop. Unsupported or disabled drills are no-ops. |
| `drillMenu` | `ReactNode` | Render as `{drillMenu}` inside the chart wrapper. This is a menu element, not a component to instantiate. |

The hook reads catalog items from `GenAiStore`; it has no catalog option. It owns comparison selection, the positioned overlay, dismissal, the drill target's expanded-state notification, building the analysis definition, and opening the dialog. It also captures the original focus before the menu opens and restores focus when the menu or dialog closes.

Check KDA availability for the workspace and the current user's entitlements and permissions **before** enabling drill predicates. The `kdaEnabled` prop below represents that application-level check; setting it to `true` doesn't enable the backend feature or bypass backend permissions.

Supply an authenticated `backend`, `workspace`, a resolved `IInsight`, workspace `catalogItems` for the store, and the complete `effectiveFilters` used by your chart. Resolve saved visualization filters and application filters into that list first. Here, `insightSetFilters` applies the list to the rendered visualization, and the hook receives that same list. If your integration also uses the renderer's `filters` prop, include those filters in the hook's effective list too.

```tsx
import { useMemo, useRef } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type CatalogItem, type IFilter, type IInsight, insightSetFilters } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { InsightRenderer } from "@gooddata/sdk-ui-ext";
import {
    GenAiKeyDriverAnalysis,
    GenAiStore,
    useDrillKeyDriverAnalysis,
} from "@gooddata/sdk-ui-gen-ai";

import "@gooddata/sdk-ui-ext/styles/css/main.css";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

const locale = "en-US";

interface ChartProps {
    insight: IInsight;
    effectiveFilters: IFilter[];
    kdaEnabled: boolean;
}

function ChartWithExplain({ insight, effectiveFilters, kdaEnabled }: ChartProps) {
    const anchorRef = useRef<HTMLDivElement>(null);
    const chartInsight = useMemo(() => insightSetFilters(insight, effectiveFilters), [insight, effectiveFilters]);
    const { drillableItems, onDrill, drillMenu } = useDrillKeyDriverAnalysis({
        insight: chartInsight,
        filters: effectiveFilters,
        locale,
        enabled: kdaEnabled,
        anchorRef,
    });

    return (
        <div ref={anchorRef} style={{ height: 400 }}>
            <InsightRenderer
                insight={chartInsight}
                locale={locale}
                settings={undefined}
                colorPalette={undefined}
                drillableItems={drillableItems}
                onDrill={onDrill}
            />
            {drillMenu}
        </div>
    );
}

export function KdaChartExample({
    backend, workspace, catalogItems, ...chartProps
}: ChartProps & { backend: IAnalyticalBackend; workspace: string; catalogItems: CatalogItem[] }) {
    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <GenAiStore catalogItems={catalogItems}>
                    <ChartWithExplain {...chartProps} />
                    <GenAiKeyDriverAnalysis locale={locale} />
                </GenAiStore>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

`BackendProvider` and `WorkspaceProvider` supply the renderer and dialog, not just the store. Mount only one dialog per store; you don't need to mount `GenAIAssistant` to use this flow. The example uses the existing low-level `InsightRenderer`, which is currently `@internal`; the new KDA API doesn't change its maturity.

The menu presents **all** supported comparisons, including when there's only one; it never silently chooses the first. The hook handles menu keyboard navigation, dismissal, and restoring the original chart-point or table-cell focus. You don't need application-owned menu state, a separate overlay, or a focus-capture handler.

The analysis definition includes only attribute filters. Non-date attribute values from the clicked point override chart attribute filters on the same display form. Date filters and measure filters aren't copied: the selected comparison defines the analysis date range. The menu localizes its labels using `locale`.

## Listen to the analysis on a dashboard

The Dashboard component fires two `@beta` events around the analysis. Both carry the drill definition and the `IDashboardDrillEvent` of the click that started it, so you know which widget and which measure the user asked about.

| Event type | When |
| :-- | :-- |
| `GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.REQUESTED` | The user picked a comparison from the menu and the analysis started. |
| `GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.RESOLVED` | The command finished and the analysis definition is resolved. The dashboard then hands the definition to the dialog. |

Register a handler the same way as for any other dashboard event, through the `eventHandlers` prop or from a plugin. [Handle dashboard events](../../dashboard-plugins/dashboard-events/) explains both.

```ts
import {
    type DashboardEventHandler,
    type IDashboardKeyDriverAnalysisRequested,
    isDashboardKeyDriverAnalysisRequested,
} from "@gooddata/sdk-ui-dashboard";

export const trackKeyDriverAnalysis: DashboardEventHandler<IDashboardKeyDriverAnalysisRequested> = {
    eval: isDashboardKeyDriverAnalysisRequested,
    handler: (event) => {
        const { widgetRef, drillContext } = event.payload.drillEvent;
        // widgetRef: the widget the user clicked
        // drillContext.intersection: the measure and attribute values of the clicked point
    },
};
```

The payloads also include the analysis parameters. Shared KDA definition and comparison types remain internal to `@gooddata/sdk-ui-dashboard`; they aren't re-exported from `@gooddata/sdk-ui-gen-ai` or required by the chart hook.

## The drill definition in the model

In `@gooddata/sdk-model`, Key Driver Analysis is a drill type like drill-down or cross-filtering: `IKeyDriveAnalysis` with `type: "keyDriveAnalysis"` is one of the `InsightDrillDefinition` variants, and `isKeyDriveAnalysis` narrows to it. You'll meet it in the `drillDefinitions` of a dashboard drill event. You don't configure it on a widget yourself. The Dashboard component derives it from the conditions above.

## API maturity

`useDrillKeyDriverAnalysis`, `IUseDrillKeyDriverAnalysisOptions`, and `IUseDrillKeyDriverAnalysisResult` are `@beta`. `GenAiKeyDriverAnalysis` and `GenAiStore` are public components. Dashboard KDA events and their type guards remain `@beta`; the `IKeyDriveAnalysis` model type remains available for dashboard integrations. The hook doesn't expose separate builder, comparison, predicate, opener, or menu APIs.

This doesn't make every KDA implementation detail public. In particular, `KdaDialog` and the backend analysis service remain `@internal`; don't import internal modules or call that service directly. See [API maturity](../../integrations/platform/api-maturity/) for the stability guarantees.
