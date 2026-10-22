---
title: Key Driver Analysis
category: AI & Modules
diataxis_type: explanation
related_pages:
  - /docs/dashboard-plugins/dashboard-events
  - /docs/dashboard-plugins/dashboard
  - /docs/ai-modules/ai-assistant
  - /docs/integrations/interactivity/drillable-items
  - /docs/integrations/platform/api-maturity
type: docs
ai_generated_body: true
description: Where Key Driver Analysis shows up in GoodData.UI, what a dashboard visualization needs for the "Run Key Driver Analysis" action to appear, and how to observe the analysis through dashboard events.
weight: 58
section: AI & Modules
---

Key Driver Analysis finds the attribute values that explain a change in a measure between two periods: which regions, products, or channels moved revenue the most, and in which direction. It's a GoodData Cloud feature in beta, described in [Key Driver Analysis](https://www.gooddata.ai/docs/cloud/ai/use-ai_assistant/key-driver-analysis/) in the GoodData Cloud documentation. GoodData.UI doesn't add a standalone component for it. The analysis surfaces inside two components you may already embed, and the Dashboard component announces it through events you can listen to.

## Where it appears

| Component | How users reach it | What your code can do |
| :-- | :-- | :-- |
| [Dashboard](../../dashboard-plugins/dashboard/) | Click a data point in a visualization and choose **Run Key Driver Analysis** from the drill menu. The dashboard opens the analysis in a dialog. | Listen to the `GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.*` events, see [below](#listen-to-the-analysis-on-a-dashboard). |
| [AI Assistant](../ai-assistant/) | Ask a "why" question, such as "Why did revenue drop last month?", or run the analysis on a visualization the assistant created. The answer renders in the chat. | Mount `GenAiKeyDriverAnalysis` next to the assistant to run the analysis on its charts, see [Key Driver Analysis component](../ai-assistant/#key-driver-analysis-component). |

Both run the analysis on your GoodData Cloud instance and render the result. In the AI Assistant, the analysis dialog is the public `GenAiKeyDriverAnalysis` component. GoodData.UI has no public hook or backend method for running Key Driver Analysis yourself: the service interface is `@internal`, so it can change in any release.

## What a dashboard needs

The Dashboard component adds **Run Key Driver Analysis** to a data point's drill menu on its own, next to the drill-downs and other interactions the dashboard author configured. The entry appears when all of the following hold:

- AI features are enabled for the organization and the workspace, and the user may use the AI Assistant in that workspace. The Dashboard component reads this from the workspace settings it loads at startup.
- The visualization is sliced by exactly one date attribute, with a granularity the analysis supports: year, quarter, month, week, day, hour, or minute.
- The measure is allowed for Key Driver Analysis. Analytics builders can switch it off per measure in the Analytics Catalog (**Use for Key driver analysis**) and per visualization in Analyze. Objects a builder excluded carry `isHiddenFromKda: true` when you read them from the catalog.
- The visualization type supports it. Headlines don't.

The menu offers one entry per comparison the clicked point allows, such as against the previous period or against the same period a year earlier. Which attributes the analysis considers, and how the result is ranked, is configured on the GoodData Cloud side.

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

The payloads also include the analysis parameters themselves, but those types are `@internal` and not part of the public API.

## The drill definition in the model

In `@gooddata/sdk-model`, Key Driver Analysis is a drill type like drill-down or cross-filtering: `IKeyDriveAnalysis` with `type: "keyDriveAnalysis"` is one of the `InsightDrillDefinition` variants, and `isKeyDriveAnalysis` narrows to it. You'll meet it in the `drillDefinitions` of a dashboard drill event. You don't configure it on a widget yourself. The Dashboard component derives it from the conditions above.

## API maturity

The events, their type guards, and the `IKeyDriveAnalysis` type are the public surface. Everything else that mentions Key Driver Analysis in the API reference, such as the `KdaDialog` component, the key-driver combination items, and the backend service, is `@internal` or `@alpha`. See [API maturity](../../integrations/platform/api-maturity/) for what that means for your code.
