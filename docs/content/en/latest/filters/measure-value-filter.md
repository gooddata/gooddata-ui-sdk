---
legacy_path: references/filters/measure_value_filter
title: Measure value filter
category: Filters
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-filters:MeasureValueFilter"
source_files:
  - src/MeasureValueFilter/MeasureValueFilter.tsx
related_pages:
  - /docs/filters/ranking-filter
  - /docs/filters/filter-visual-components
  - /docs/filters/attribute-filter-button
  - /docs/filters/date-filter
type: docs
description: Let users edit and apply a measure value filter, configure input formatting and null handling, or render the dropdown with a custom toggle button.
weight: 46
section: Filters
aliases:
  - "../references/filters/measure_value_filter/"
---

`MeasureValueFilter` is a dropdown that lets users create a measure value filter or edit an existing one. When a user clicks **Apply**, the `onApply` callback receives a measure value filter that you can pass to a visualization.

{{< figure src="/gd-ui/mvf_combined.png" alt="MeasureValueFilter toggle button and its open dropdown with an operator picker and a value input" >}}

## Structure

```tsx
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import { MeasureValueFilter } from "@gooddata/sdk-ui-filters";

<MeasureValueFilter
  onApply={<on-apply-callback>}
  onCancel={<on-cancel-callback>}
  filter={<filter>}
  measureIdentifier={<measure-local-identifier>}
  buttonTitle={<toggle-button-title>}
  usePercentage={<percentage-measure-boolean>}
  warningMessage={<warning-message>}
/>
```

## Example

The following example shows a bar chart displaying one measure sliced by one attribute. Users can filter the displayed bars with `MeasureValueFilter`.

```tsx
import { useState } from "react";
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { MeasureValueFilter } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { type IMeasureValueFilter, measureLocalId, newMeasureValueFilter } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

const measureTitle = "$ Total Sales";

export const SalesByResort = () => {
    const [filter, setFilter] = useState<IMeasureValueFilter | null>(
        newMeasureValueFilter(Md.$TotalSales, "GREATER_THAN", 0),
    );

    return (
        <div>
            <MeasureValueFilter
                onApply={setFilter}
                filter={filter ?? undefined}
                measureIdentifier={measureLocalId(Md.$TotalSales)}
                buttonTitle={measureTitle}
            />
            <BarChart
                measures={[Md.$TotalSales]}
                viewBy={[Md.LocationResort]}
                filters={filter ? [filter] : []}
            />
        </div>
    );
};
```

## Formatting user input

The `separators` prop sets the thousands separator (`,` by default) and the decimal separator (`.` by default) of the value input.

```tsx
<MeasureValueFilter
    onApply={setFilter}
    measureIdentifier={measureLocalId(Md.$TotalSales)}
    buttonTitle="$ Total Sales"
    separators={{ thousand: " ", decimal: "," }}
/>
```

## Percentage measures

Set `usePercentage` to `true` to format the filtered measure as a percentage, so the dropdown accepts percentage values instead of the measure values. It defaults to `false`.

Keep `usePercentage` set to `false` when the filtered measure has `computeRatio` enabled: such a measure is filtered by its actual values, not by the percentages. See [Filter by a percentage measure](../filter-visual-components/#filter-by-a-percentage-measure).

## Warning message

`warningMessage` shows a message in the dropdown. Pass a string, or an object with `text` and `severity` (`"low"`, `"medium"`, or `"high"`), where `severity` sets the background color of the message.

## Operator selection

Users can pick the comparison operator in the dropdown. To hide the operator picker, set `enableOperatorSelection` to `false`. It defaults to `true`.

## Treating null values as 0

By default, an execution containing a measure value filter does not pass null (missing) values to arithmetic operations.
However, you can allow users to make the execution treat the null values as 0 and include the null results in the filtering process.

To let users do so, show the "Treat blank values as 0" checkbox in the filter dialog by setting `displayTreatNullAsZeroOption` to `true`. To select the checkbox by default, set `treatNullAsZeroDefaultValue` to `true`. Both default to `false`.

{{< figure src="/gd-ui/mvf_treat_null_values_as.png" alt="Measure value filter dialog with the Treat blank values as 0 checkbox selected" >}}

```tsx
<MeasureValueFilter
    onApply={setFilter}
    measureIdentifier={measureLocalId(Md.$TotalSales)}
    buttonTitle="$ Total Sales"
    displayTreatNullAsZeroOption={true}
    treatNullAsZeroDefaultValue={true}
/>
```

## Custom toggle button

To toggle the filter dropdown with your own button, use `MeasureValueFilterDropdown` (beta). It renders only the dropdown body, outside of the current DOM tree, using [portals](https://react.dev/reference/react-dom/createPortal).

{{< figure src="/gd-ui/mvf_custom_button.png" alt="Custom toggle button with the measure value filter dropdown open below it" >}}

`MeasureValueFilterDropdown` takes the same props as `MeasureValueFilter`, with these differences:

- It has no `buttonTitle`.
- `onCancel` is required, because you use it to hide the dropdown.
- `anchorEl` (optional) sets the element the dropdown is aligned to, typically your toggle button. It takes an `HTMLElement` or a CSS selector string and defaults to `"body"`.

## Props

{{% props %}}
