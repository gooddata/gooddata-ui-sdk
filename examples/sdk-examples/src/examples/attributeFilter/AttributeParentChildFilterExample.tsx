// (C) 2007-2021 GoodData Corporation
import React, { useState } from "react";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
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
    m.format("#,##0").alias("$ Total Sales").title("Total Sales").localId("totalSales"),
);

export const AttributeParentChildFilterExample: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(attributeDisplayFormRef(Md.LocationCity), { uris: [] }),
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

    return (
        <div className="s-attribute-filter">
            <AttributeFilter filter={parentFilter} fullscreenOnMobile={false} onApply={setParentFilter} />
            <AttributeFilter
                filter={filter}
                parentFilters={parentFilter ? [parentFilter] : []}
                parentFilterOverAttribute={idRef(locationIdAttributeIdentifier)}
                fullscreenOnMobile={false}
                onApply={setFilter}
            />
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
