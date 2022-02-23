// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    attributeDisplayFormRef,
    IAttributeFilter,
    idRef,
    modifyMeasure,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const locationIdAttributeIdentifier = "attr.restaurantlocation.locationid";
const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

export const AttributeParentChildFilterButtonExample: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(attributeDisplayFormRef(Md.LocationCity), {
            uris: [],
        }),
    );
    const [parentFilter, setParentFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(attributeDisplayFormRef(Md.LocationState), {
            uris: [],
        }),
    );

    const onError: OnError = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    const onLoadingChanged: OnLoadingChanged = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    /**
     * What happens with the component depending on the child filters is handled outside the AttributeFilterButton component.
     */
    const onParentApply = (filter: IAttributeFilter) => {
        setFilter(
            newNegativeAttributeFilter(attributeDisplayFormRef(Md.LocationCity), {
                uris: [],
            }),
        );
        setParentFilter(filter);
    };

    return (
        <div className="s-attribute-filter">
            <div style={{ display: "flex" }}>
                <AttributeFilterButton filter={parentFilter} onApply={onParentApply} />
                <AttributeFilterButton
                    filter={filter}
                    parentFilters={parentFilter ? [parentFilter] : []}
                    parentFilterOverAttribute={idRef(locationIdAttributeIdentifier)}
                    onApply={setFilter}
                />
            </div>
            <div style={{ height: 300 }} className="s-line-chart">
                <BarChart
                    measures={[TotalSales]}
                    viewBy={Md.LocationCity}
                    filters={[filter, parentFilter]}
                    onLoadingChanged={onLoadingChanged}
                    onError={onError}
                />
            </div>
        </div>
    );
};
