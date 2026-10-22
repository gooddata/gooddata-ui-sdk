---
legacy_path: references/filters/date_filter
title: Date filter
category: Filters
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-filters:DateFilter"
  - "@gooddata/sdk-ui-filters:IDateFilterProps"
source_files:
  - src/DateFilter/DateFilter.tsx
props_interfaces:
  - IDateFilterProps
  - IDateFilterOwnProps
  - IDateFilterStatePropsIntersection
  - IDateFilterCallbackProps
related_pages:
  - /docs/filters/filter-visual-components
  - /docs/filters/attribute-filter-button
  - /docs/data-layer/execution/time-over-time
  - /docs/filters/inspecting-filters
  - /docs/filters/customize-date-filter-presets
type: docs
description: Configure DateFilter with filter options, granularities, and a date format, and handle the applied selection.
weight: 45
section: Filters
aliases:
  - "../references/filters/date_filter/"
---

`DateFilter` is a dropdown that lists date filter options. You pass the options to offer (`filterOptions`) and an `onApply` callback. When a user clicks **Apply**, the callback receives the selected option and the exclude-current-period flag.

{{< figure src="/gd-ui/date_filter.png" alt="DateFilter dropdown open with All time, Static period, Relative period, and presets grouped by year, quarter, month, and day" >}}

## Structure

```tsx
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import { DateFilter } from "@gooddata/sdk-ui-filters";

<DateFilter
    filterOptions={<date-filter-options>}
    selectedFilterOption={<selected-option>}
    excludeCurrentPeriod={<boolean>}
    availableGranularities={<granularities>}
    dateFilterMode={<"active" | "readonly" | "hidden">}
    onApply={<on-apply-callback>}
/>;
```

## Example

The filter starts on **All time**. When a user clicks **Apply**, the component stores the selected option and the exclude-current-period flag in state.

```tsx
import { useState } from "react";
import { DateFilter, defaultDateFilterOptions, type DateFilterOption } from "@gooddata/sdk-ui-filters";
import type { DateFilterGranularity } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/main.css";

const availableGranularities: DateFilterGranularity[] = [
    "GDC.time.month",
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.date",
];

// Provide your own date filter options (IDateFilterOptionsByType), or use the defaults
const dateFilterOptions = defaultDateFilterOptions;

export const DateFilterExample = () => {
    const [selectedFilterOption, setSelectedFilterOption] = useState<DateFilterOption>(
        dateFilterOptions.allTime!,
    );
    const [excludeCurrentPeriod, setExcludeCurrentPeriod] = useState(false);

    return (
        <div style={{ width: 300 }}>
            <DateFilter
                excludeCurrentPeriod={excludeCurrentPeriod}
                selectedFilterOption={selectedFilterOption}
                filterOptions={dateFilterOptions}
                availableGranularities={availableGranularities}
                customFilterName="Date filter name"
                dateFilterMode="active"
                dateFormat="M/d/yy"
                onApply={(option, exclude) => {
                    setSelectedFilterOption(option);
                    setExcludeCurrentPeriod(exclude);
                }}
            />
        </div>
    );
};
```

To turn the selected option into a filter for a visualization, call `DateFilterHelpers.mapOptionToAfm(option, dateDataSetRef, excludeCurrentPeriod)`. It returns an `IDateFilter`, or `null` for **All time**.

## Granularities

`availableGranularities` sets the granularities users can pick in the relative period form.

{{% alert color="warning" title="Removed option" %}}
The `availableGranularities` option of `relativeForm` in the filter options was removed. Use the `availableGranularities` prop of `DateFilter` instead.
{{% /alert %}}

## Date format

`dateFormat` sets how dates are displayed. Use any format that the [date-fns](https://date-fns.org/docs/format) library supports.

{{< figure src="/gd-ui/date_filter_international_date_format.png" alt="Two DateFilter dropdowns side by side, one showing dates in dd/MM/yyyy format and one in M/d/yy format" >}}

## Time filtering

To let users pick a time in addition to a date in the static period form, set `isTimeForAbsoluteRangeEnabled` to `true`. Only GoodData Cloud and GoodData.CN support it.

{{< figure src="/gd-ui/date_filter_time.png" alt="DateFilter static period form with date and time inputs for the range start and end" >}}

## Dashboard date filter presets

The presets that dashboards show in their date filters come from the `dateFilterConfig` organization or workspace setting, not from `DateFilter` props. See [Customize the date filter presets](../customize-date-filter-presets/).

## Props

{{% props %}}
