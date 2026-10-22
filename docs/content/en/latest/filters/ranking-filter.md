---
legacy_path: references/filters/ranking_filter
title: Ranking filter
category: Filters
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-filters:RankingFilter"
source_files:
  - src/RankingFilter/RankingFilter.tsx
props_interfaces:
  - IRankingFilterProps
related_pages:
  - /docs/filters/measure-value-filter
  - /docs/filters/filter-visual-components
  - /docs/filters/attribute-filter-button
  - /docs/filters/date-filter
type: docs
description: Let users edit and apply a ranking filter to a visualization, or render the filter dropdown with a custom toggle button.
weight: 47
section: Filters
aliases:
  - "../references/filters/ranking_filter/"
---

`RankingFilter` is a dropdown that lets users create a ranking filter or edit an existing one. When a user clicks **Apply**, the `onApply` callback receives a ranking filter that you can pass to a visualization.

{{< figure src="/gd-ui/ranking_filter_combined.png" alt="RankingFilter toggle button and its open dropdown with Top or Bottom, a count, and a measure picker" >}}

## Structure

```tsx
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import { RankingFilter } from "@gooddata/sdk-ui-filters";

<RankingFilter
  onApply={<on-apply-callback>}
  onCancel={<on-cancel-callback>}
  filter={<filter>}
  buttonTitle={<toggle-button-title>}
  measureItems={<visualization-measures>}
  attributeItems={<visualization-attributes>}
/>
```

## Example

The following example shows a table displaying one measure sliced by one attribute. Users can filter the displayed rows with `RankingFilter`.

```tsx
import { FC, Fragment, useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    attributeLocalId,
    localIdRef,
    measureLocalId,
    modifyAttribute,
    modifyMeasure,
    newRankingFilter,
} from "@gooddata/sdk-model";
import { RankingFilter, type IMeasureDropdownItem, type IAttributeDropdownItem } from "@gooddata/sdk-ui-filters";
import * as Md from "./catalog.js";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId("franchiseFees").title("Franchise Fees"),
);
const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").localId("franchiseSales"),
);
const LocationState = modifyAttribute(Md.LocationState, (a) => a.localId("LocationState"));
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("locationName"));

const measures = [FranchiseFees, FranchisedSales];
const attributes = [LocationState, LocationName];

const measureDropdownItems: IMeasureDropdownItem[] = [
    {
        title: "Franchise fees",
        ref: localIdRef(measureLocalId(FranchiseFees)),
        sequenceNumber: "M1",
    },
    {
        title: "Franchised sales",
        ref: localIdRef(measureLocalId(FranchisedSales)),
        sequenceNumber: "M2",
    },
];
const attributeDropdownItems: IAttributeDropdownItem[] = [
    {
        title: "Location state",
        ref: localIdRef(attributeLocalId(LocationState)),
        type: "ATTRIBUTE",
    },
    {
        title: "Location",
        ref: localIdRef(attributeLocalId(LocationName)),
        type: "ATTRIBUTE",
    },
];
export const RankingFilterExample: FC = () => {
    const [filter, setFilter] = useState(newRankingFilter(measureLocalId(FranchisedSales), "TOP", 3));
    return (
        <Fragment>
            <RankingFilter
                measureItems={measureDropdownItems}
                attributeItems={attributeDropdownItems}
                filter={filter}
                onApply={(filter) => setFilter(filter)}
                buttonTitle={"Ranking filter"}
            />
            <hr className="separator" />
            <div style={{ height: 300 }} className="s-pivot-table">
                <PivotTable measures={measures} rows={attributes} filters={[filter]} />
            </div>
        </Fragment>
    );
};
```

## Custom toggle button

To toggle the filter dropdown with your own button, use `RankingFilterDropdown`. It renders only the dropdown body, outside of the current DOM tree, using [portals](https://react.dev/reference/react-dom/createPortal).

{{< figure src="/gd-ui/ranking_filter_custom_button.png" alt="Custom toggle button with the ranking filter dropdown open below it" >}}

`RankingFilterDropdown` takes the same props as `RankingFilter` (see [Props](#props)), with these differences:

- It has no `buttonTitle`.
- `onCancel` is required, because you use it to hide the dropdown.
- `anchorEl` (optional) sets the element the dropdown is aligned to, typically your toggle button. It takes an `HTMLElement` or a CSS selector string and defaults to `"body"`.

## Props

{{% props %}}
