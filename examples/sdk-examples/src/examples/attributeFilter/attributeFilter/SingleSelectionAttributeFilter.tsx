// (C) 2007-2023 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    idRef,
    newPositiveAttributeFilter,
    newNegativeAttributeFilter,
    IAttributeFilter,
    modifyMeasure,
} from "@gooddata/sdk-model";

import * as Md from "../../../md/full";

const employeeNameDisplayFormIdentifier = "label.employee.employeename";

const SingleSelectionAttributeFilterBasicUsage = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newPositiveAttributeFilter(idRef(employeeNameDisplayFormIdentifier), ["Abbie Adams"]),
    );

    return (
        <div>
            <h4>Single selection Attribute filter - basic usage</h4>
            <AttributeFilter
                filter={filter}
                selectionMode="single"
                onApply={(filter, _isInverted, _selectionMode) => {
                    setFilter(filter);
                }}
            />
        </div>
    );
};

const locationIdAttributeIdentifier = "attr.restaurantlocation.locationid";
const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

const SingleSelectionAttributeFilterParentChildFiltering: React.FC = () => {
    const [parentFilter, setParentFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Md.LocationState, {
            uris: [],
        }),
    );

    const [filter, setFilter] = useState<IAttributeFilter>(
        newPositiveAttributeFilter(Md.LocationCity, { uris: [] }),
    );

    return (
        <div>
            <h4>Single selection Attribute filter - parent filtering</h4>
            <AttributeFilter filter={parentFilter} onApply={setParentFilter} />
            <AttributeFilter
                filter={filter}
                selectionMode="single"
                parentFilters={parentFilter ? [parentFilter] : []}
                parentFilterOverAttribute={idRef(locationIdAttributeIdentifier)}
                onApply={setFilter}
            />
            <div style={{ height: 300 }}>
                <BarChart measures={[TotalSales]} viewBy={Md.LocationCity} filters={[filter, parentFilter]} />
            </div>
        </div>
    );
};

export const SingleSelectionAttributeFilter = () => {
    return (
        <div>
            <SingleSelectionAttributeFilterBasicUsage />
            <SingleSelectionAttributeFilterParentChildFiltering />
        </div>
    );
};

export default SingleSelectionAttributeFilter;
