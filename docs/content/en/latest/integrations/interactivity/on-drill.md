---
legacy_path: learn/add_interactivity/on_drill
title: onDrill
category: Integrations / Interactivity
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:IVisualizationCallbacks"
  - "@gooddata/sdk-ui:IDrillEvent"
source_files:
  - src/insightView/InsightView.tsx
props_interfaces:
  - IInsightViewProps
  - Partial<IVisualizationCallbacks>
related_pages:
  - /docs/integrations/interactivity/drillable-items
  - /docs/integrations/interactivity/predicates
  - /docs/dashboard-plugins/customize-widgets
  - /docs/visualisations/insightview
description: Handle drill events with the onDrill callback when users click drillable items in InsightView and the chart components.
ai_generated_description: true
type: docs
weight: 91
section: Integrations
subsection: Interactivity
aliases:
  - "../../learn/add_interactivity/on_drill/"
---

The `onDrill` callback runs when the user clicks a [drillable item](../drillable-items/) in a visualization. `InsightView`, the chart components, and the pivot table accept it. Use it to respond to the click in your app, for example to open a detail view filtered by the clicked value.

## Structure

```ts
onDrill?: (event: IDrillEvent) => void | boolean;
```

The `IDrillEvent` holds:

- `dataView`: the data the visualization was rendered from.
- `drillContext`: what the user clicked, including the type of the clicked element and the `intersection` of measures and attribute values at that point.

## Example

```tsx
import { HeaderPredicates, type IDrillEvent } from "@gooddata/sdk-ui";
import { InsightView } from "@gooddata/sdk-ui-ext";

function handleDrill(event: IDrillEvent) {
    console.log(event.drillContext.intersection);
}

export function DrillableVisualization() {
    return (
        <InsightView
            insight="<visualization-id>"
            drillableItems={[HeaderPredicates.identifierMatch("<measure-or-attribute-id>")]}
            onDrill={handleDrill}
        />
    );
}
```

## Notes

- After `onDrill` runs, the visualization also dispatches a `drill` DOM event that bubbles up from the visualization's element, with the same `IDrillEvent` as its `detail`. Return `false` from `onDrill` to stop that DOM event; any other return value lets it through.
- Only items that match `drillableItems` are drillable. Without `drillableItems`, `onDrill` never runs. See [Make visualizations drillable](../drillable-items/).
