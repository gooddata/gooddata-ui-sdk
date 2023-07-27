---
title: Date Filter
linkTitle: Date Filter
copyright: (C) 2007-2019 GoodData Corporation
---

> **Known issues**:
> - `availableGranularities` in `relativeForm` has been removed. Use the `availableGranularities` from the Date Filter component instead.
> - Values of Relative Form filters are not validated against the [platform limits for dates](https://support.gooddata.com/hc/en-us/articles/215858108#anchor_8). If the limit is hit, no data is shown in the filter.
>   - _This issue may be fixed in one of the future releases._

The **Date Filter component** is a dropdown component that lists [date filter options](../date_filter/). You can pass allowed options and a callback function, which receives a list of the selected values when a user clicks **Apply**.

![DateFilter Component](gd-ui/date_filter.png "DateFilter Component")

In the Date Filter component, you can optionally define the following:

* The attribute values that should be selected in the filter by default
* The format in which dates should be displayed

    To define the date format, use any value supported by the [date-fns](https://date-fns.org/docs/format) library.
    ![DateFilter Component with International Date Format](gd-ui/date_filter_international_date_format.png "DateFilter Component with dates are displayed in desired formats")

* Support for time filtering.

    Only available for GoodData Cloud and GoodData.CN.


![DateFilter Component](gd-ui/date_filter_time.png "DateFilter Component with time support")

## Example

In the following example, attribute values are listed and the ```onApply``` callback function is triggered when a user clicks **Apply** to confirm the selection.

```jsx harmony
import React, { Component } from "react";
import { DateFilter, defaultDateFilterOptions } from "@gooddata/sdk-ui-filters";
import { myDateFilterOptions } from "myDateFilterConfiguration";

import "@gooddata/sdk-ui-filters/styles/css/main.css";

const availableGranularities = [
    "GDC.time.month",
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.date"];

// You can either provide your custom date filter options
const dateFilterOptions = myDateFilterOptions();
// or use the default we provide
const dateFilterOptions = defaultDateFilterOptions;

export class DateFilterComponentExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFilterOption: dateFilterOptions.allTime,
            excludeCurrentPeriod: false,
        };
    }

    onApply = (dateFilterOption, excludeCurrentPeriod) => {
        this.setState({
            selectedFilterOption: dateFilterOption,
            excludeCurrentPeriod,
        });
        // eslint-disable-next-line no-console
        console.log(
            "DateFilterExample onApply",
            "selectedFilterOption:",
            dateFilterOption,
            "excludeCurrentPeriod:",
            excludeCurrentPeriod,
        );
    };

    render() {
        return (
            <div style={{ width: 300 }}>
                <DateFilter
                    excludeCurrentPeriod={this.state.excludeCurrentPeriod}
                    selectedFilterOption={this.state.selectedFilterOption}
                    filterOptions={dateFilterOptions}
                    availableGranularities={availableGranularities}
                    customFilterName="Date filter name"
                    dateFilterMode="active"
                    dateFormat="M/d/yy"
                    onApply={this.onApply}
                />
            </div>
        );
    }
}
```

**NOTE:** For the complete source code, see [Live Examples](https://gdui-examples.herokuapp.com/date-filter-component).

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| excludeCurrentPeriod | true | boolean | The state of the "Exclude current period" checkbox |
| selectedFilterOption | true | DateFilterOption | The selected filter option |
| filterOptions | true | DateFilterOptions | Available filter options |
| availableGranularities | true | DateFilterGranularity[] | An array of available types of granularity for the Relative Form  |
| customFilterName | false | string | A custom filter label |
| dateFilterMode | true | string | Filter mode; can be `readonly`, `hidden`, or `active` |
| dateFormat | false | string | Date format. Defaults to `MM/dd/yyyy`. For the supported values, see the `date-fns` library. |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| isTimeForAbsoluteRangeEnabled | false | boolean | Determine whether the static period form allows the user to set also the time of the date range or only the date. |
| locale | false | string | The localization of the component. Defaults to `en-US`. |
| onApply | true | Function | A callback when the selection is confirmed by the user |
| onCancel | false | Function | A callback when the selection is canceled by the user |
| onOpen | false | Function | A callback when the filter dropdown is opened by the user |
| onClose | false | Function | A callback when the filter dropdown is closed by the user |
