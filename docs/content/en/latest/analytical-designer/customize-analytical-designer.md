---
title: Customize Analytical Designer
description: Hide header actions, make Analytical Designer read-only, filter its catalog, theme it, and replace its loading and error screens with slots.
diataxis_type: howto
type: docs
weight: 4
api_symbols:
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerConfig"
  - "@gooddata/sdk-ui-analytical-designer:IAnalyticalDesignerSlots"
  - "@gooddata/sdk-ui-analytical-designer:AnalyticalDesignerSlotComponent"
source_files:
  - src/embedding/analyticalDesignerTypes.ts
  - src/embedding/slots.tsx
related_pages:
  - /docs/analytical-designer/analytical-designer
  - /docs/analytical-designer/handle-analytical-designer-events
  - /docs/integrations/embedding/apply-theming
section: Analytical Designer
category: Analytical Designer
ai_generated_body: true
---

When you finish, Analytical Designer shows only the actions and catalog items your application allows, uses your theme, and shows your own loading and error screens.

## Hide header actions

List the actions to hide in `config.hiddenActions`. Set `config.isReadOnly` to hide every action that changes the visualization: save, save as, and create new.

```tsx
<AnalyticalDesigner
    insight="<visualization-id>"
    config={{
        hiddenActions: ["export", "saveAs", "openInAnalyticalDesigner"],
        displayedActions: ["cancel"],
    }}
    onEvent={(event) => {
        if (event.type === "insightEditingCancelled") {
            navigateBack();
        }
    }}
/>
```

The **Cancel** action is hidden by default. Show it with `displayedActions: ["cancel"]`, and handle the `insightEditingCancelled` event in `onEvent`.

## Filter the catalog

Show only the catalog items with one of the tags in `config.includeObjectsWithTags`, or hide the items with one of the tags in `config.excludeObjectsWithTags`:

```tsx
<AnalyticalDesigner config={{ includeObjectsWithTags: ["sales"], excludeObjectsWithTags: ["internal"] }} />
```

## Open a visualization from a dashboard

Two flows open a visualization from another context:

- **Edit from a dashboard**: pass `config.sourceDashboard` with the dashboard. The header offers going back to it. Pass an empty string when the dashboard is not saved yet.
- **Explore**: pass `config.sourceInsight` with the visualization. Analytical Designer opens it as an unsaved copy, and saving creates a new visualization.

```tsx
<AnalyticalDesigner insight="<visualization-id>" config={{ sourceDashboard: "<dashboard-id>" }} />
```

## Theme Analytical Designer

Analytical Designer loads and applies the workspace theme. To change that:

- Pass `theme` to apply your theme instead.
- Pass `disableThemeLoading` to apply none.
- Pass `themeModifier` to change the theme before Analytical Designer applies it.

```tsx
<AnalyticalDesigner
    themeModifier={(theme) => ({ ...theme, palette: { ...theme.palette, primary: { base: "#14b2e2" } } })}
/>
```

The theme is read when the component mounts. See [Apply theming](../../integrations/embedding/apply-theming/) for the theme object.

## Replace the loading and error screens

`slots` replaces or wraps the `Loading` and `Error` regions. A slot component gets the default region as `Default` and its props as `defaultProps`, so you can wrap the default or render your own:

```tsx
import {
    AnalyticalDesigner,
    type AnalyticalDesignerSlotComponent,
    type IAnalyticalDesignerErrorProps,
    type IAnalyticalDesignerLoadingProps,
    type IAnalyticalDesignerSlots,
} from "@gooddata/sdk-ui-analytical-designer";

const HostLoading: AnalyticalDesignerSlotComponent<IAnalyticalDesignerLoadingProps> = ({
    Default,
    defaultProps,
}) => (
    <div className="my-loading">
        <p>Starting Analytical Designer…</p>
        <Default {...defaultProps} />
    </div>
);

const HostError: AnalyticalDesignerSlotComponent<IAnalyticalDesignerErrorProps> = ({ defaultProps }) => (
    <div className="my-error">
        {defaultProps.error instanceof Error ? defaultProps.error.message : "Analytical Designer cannot start."}
    </div>
);

// Define the slots outside the component, so they keep their identity between renders.
const slots: IAnalyticalDesignerSlots = { Loading: HostLoading, Error: HostError };

<AnalyticalDesigner insight="<visualization-id>" slots={slots} />;
```

`Error` covers both a failed load and the errors Analytical Designer hits while it starts.

## Forward telemetry

Analytical Designer tracks nothing by default. To get its events, page views, and timings in your telemetry, pass `config.telemetryCallbacks`:

```tsx
<AnalyticalDesigner
    config={{
        telemetryCallbacks: {
            trackEvent: (eventName, data) => analytics.track(eventName, data),
            trackPageView: (page, data) => analytics.page(page, data),
            trackTiming: (variable, label, valueMs) => analytics.timing(variable, label, valueMs),
        },
    }}
/>
```

`telemetryCallbacks` is read when the component mounts.
