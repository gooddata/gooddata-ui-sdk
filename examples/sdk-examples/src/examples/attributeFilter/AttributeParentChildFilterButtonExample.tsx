// (C) 2007-2020 GoodData Corporation
import React, { useState } from "react";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    attributeDisplayFormRef,
    IAttributeFilter,
    idRef,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

export const AttributeParentChildFilterButtonExample: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(attributeDisplayFormRef(Ldm.LocationCity), {
            uris: [],
        }),
    );
    const [parentFilter, setParentFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(attributeDisplayFormRef(Ldm.LocationState), {
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
            <div style={{ display: "flex" }}>
                <AttributeFilterButton filter={parentFilter} onApply={setParentFilter} />
                <AttributeFilterButton
                    filter={filter}
                    parentFilters={parentFilter ? [parentFilter] : []}
                    parentFilterOverAttribute={idRef(LdmExt.locationIdAttributeIdentifier)}
                    onApply={setFilter}
                />
            </div>
            <div style={{ height: 300 }} className="s-line-chart">
                <BarChart
                    measures={[LdmExt.TotalSales2]}
                    viewBy={Ldm.LocationCity}
                    filters={[filter, parentFilter]}
                    onLoadingChanged={onLoadingChanged}
                    onError={onError}
                />
            </div>
        </div>
    );
};
