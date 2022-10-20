// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { IAttributeFilter, idRef, modifyMeasure, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const locationIdAttributeIdentifier = "attr.restaurantlocation.locationid";
const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

const AttributeFilterParentChildFiltering: React.FC = () => {
    const [parentFilter, setParentFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Md.LocationState, {
            uris: [],
        }),
    );

    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Md.LocationCity, { uris: [] }),
    );

    return (
        <div>
            <AttributeFilter filter={parentFilter} onApply={setParentFilter} />
            <AttributeFilter
                filter={filter}
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

export default AttributeFilterParentChildFiltering;
