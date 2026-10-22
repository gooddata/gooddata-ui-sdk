---
legacy_path: learn/add_interactivity/on_legend_ready
title: onLegendReady
category: Integrations / Interactivity
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:OnLegendReady"
  - "@gooddata/sdk-ui-charts:ILegendData"
source_files:
  - src/interfaces/chartProps.ts
related_pages:
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
  - /docs/integrations/interactivity/on-export-ready
description: Get the legend items of a chart through the onLegendReady callback so you can render a fully custom legend.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 93
section: Integrations
subsection: Interactivity
aliases:
  - "../../learn/add_interactivity/on_legend_ready/"
---

The `onLegendReady` callback gives you the legend items of a chart so that you can render your own legend, for example outside the chart container, as a sidebar table, or shared by several charts. It's available on the chart components from `@gooddata/sdk-ui-charts` (the `IChartCallbacks` interface); `InsightView`, `PivotTable`, and `Kpi` don't offer it.

## Structure

```ts
onLegendReady?: (data: ILegendData) => void;
```

The callback receives an `ILegendData` object:

```ts
{
    legendItems: [
        {
            name: "Revenue", // the name of the series
            color: "#14b2e2", // a CSS color string, usable directly in styles
            onClick: () => {}, // toggles show/hide for the series in the chart
        },
    ],
}
```

## Example

```tsx
import { useState } from "react";
import { ColumnChart, type ILegendItem } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

export function ChartWithCustomLegend() {
    const [legendItems, setLegendItems] = useState<ILegendItem[]>([]);

    return (
        <>
            <ul>
                {legendItems.map((item) => (
                    <li key={item.name} onClick={item.onClick} style={{ color: item.color }}>
                        {item.name}
                    </li>
                ))}
            </ul>
            <ColumnChart
                measures={[Md.$TotalSales]}
                viewBy={Md.LocationState}
                stackBy={Md.LocationCity}
                config={{
                    legend: {
                        enabled: false, // disable the original legend implementation
                    },
                }}
                onLegendReady={(legendData) => setLegendItems(legendData.legendItems)}
            />
        </>
    );
}
```

## Notes

- Disable the built-in legend with `config.legend.enabled = false`; otherwise both legends render.
- The callback fires once the chart has rendered its series, and again whenever the legend items change, for example after new data arrives.
- Each item's `onClick` toggles the visibility of its series in the chart, so you don't need to implement show and hide yourself. The `legendItems` array doesn't change when you click; keep the hidden or shown state in your own component state to keep your legend in sync.
- The `color` values follow the active color palette or the explicit `colorMapping`, so keep your legend palette-aware if you allow theme switching.
