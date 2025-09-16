---
id: ranking_filter_component
title: Ranking Filter
copyright: (C) 2007-2020 GoodData Corporation
---

The **Ranking Filter component** is a dropdown component that allows you to create a new ranking filter or to edit an existing one. When a user clicks **Apply**, a callback function that contains a ranking filter ready to be used in the visualization component is called.

![Ranking Filter Component](gd-ui/ranking_filter_combined.png "Ranking Filter Component")

## Structure

```jsx
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

The following example shows a table displaying one measure sliced by one attribute. A user can use the Ranking Filter component to filter the displayed rows and see the relevant data only.

```tsx
import { FC, Fragment, useState } from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newRankingFilter, localIdRef, measureLocalId, attributeLocalId } from "@gooddata/sdk-model";
import { RankingFilter, IMeasureDropdownItem, IAttributeDropdownItem } from "@gooddata/sdk-ui-filters";
import { Md } from "../../md";

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
    const [filter, setFilter] = useState(newRankingFilter(measureLocalId(franchiseSalesLocalId), "TOP", 3));
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

## Properties

| Name                       | Required? | Type                                         | Default                                                                                                          | Description                                                                                                                                                                                                                                                                                                                                                   |
| :------------------------- | :-------- | :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| measureItems               | true      | Object with the measure's `title` (string)   |                                                                                                                  | The list of available measures from which a user can choose the measure to apply the filter to; typically, the list of the measures used in the visualization.                                                                                                                                                                                                |
|                            |           | and `ref` (ObjRefInScope) properties         |                                                                                                                  |                                                                                                                                                                                                                                                                                                                                                               |
| attributeItems             | false     | Object with the attribute's `title` (string) |                                                                                                                  | The list of available attributes from which a user can choose the attribute to apply the filter to; typically, the list of the attributes used in the visualization that defines the visualization granularity. When the property is not provided, the filter behaves as if all the attributes were selected (the visualization default granularity was set). |
|                            |           | or `ref` (ObjRefInScope) properties          |                                                                                                                  |                                                                                                                                                                                                                                                                                                                                                               |
|                            |           | The optional `type` property (string)        |                                                                                                                  |                                                                                                                                                                                                                                                                                                                                                               |
| filter                     | true      | Filter                                       |                                                                                                                  | The ranking filter definition.                                                                                                                                                                                                                                                                                                                                |
| backend                    | false     | IAnalyticalBackend                           | The object with the configuration related to communication with the backend and access to analytical workspaces. |                                                                                                                                                                                                                                                                                                                                                               |
| workspace                  | false     | string                                       | The workspace ID                                                                                                 |                                                                                                                                                                                                                                                                                                                                                               |
| onApply                    | true      | Function                                     |                                                                                                                  | A callback when the selection is confirmed by a user. The passed configuration of the ranking filter is already transformed into a ranking filter definition, which you can then send directly to a chart.                                                                                                                                                    |
| onCancel                   | false     | Function                                     |                                                                                                                  | A callback when a user clicks the Cancel button or makes the dropdown close by clicking outside of it.                                                                                                                                                                                                                                                        |
| buttonTitle                | false     | string                                       |                                                                                                                  | The title of the toggle button.                                                                                                                                                                                                                                                                                                                               |
| onDropDownItemMouseOver    | false     | Function                                     |                                                                                                                  | A callback when a user hovers over a dropdown item. `ref` of the dropdown item is passed.                                                                                                                                                                                                                                                                     |
| onDropDownItemMouseOut     | false     | Function                                     |                                                                                                                  | A callback when a user moves away from the dropdown item.                                                                                                                                                                                                                                                                                                     |
| customGranularitySelection | false     | Object with `enable` (boolean)               |                                                                                                                  | If `true`, the selection of custom granularity is enabled. If `false` (default), `warningMessage` is displayed on the item tooltip.                                                                                                                                                                                                                           |
|                            |           | and `warningMessage` (string)                |                                                                                                                  |                                                                                                                                                                                                                                                                                                                                                               |
| locale                     | false     | string                                       | `en-US`                                                                                                          | The localization of the component.                                                                                                                                                                                                                                                                                                                            |

## Custom toggle button

If you want to use your own custom button for toggling the filter dropdown, use the Ranking Filter Dropdown component. This component renders only the dropdown body outside of the current DOM tree using [portals](https://reactjs.org/docs/portals.html).

![Custom button](gd-ui/ranking_filter_custom_button.png "Custom button")

The component has all the same properties as the Ranking Filter component (see [Properties](#properties)) with the following exceptions:

- The `buttonTitle` property is irrelevant for the Ranking Filter Dropdown component.
- The `onCancel` property is mandatory for the Ranking Filter Dropdown component, because it is supposed to be used to hide the dropdown.
- The Ranking Filter Dropdown component has one additional property, `anchorEl`. This optional property specifies the element that the dropdown is aligned to, which is typically your toggle button. The property can be an event target or a string and defaults to `"body"`.

Check out our [live examples](https://github.com/gooddata/gooddata-ui-sdk/tree/master/examples/sdk-examples) for demonstration.
