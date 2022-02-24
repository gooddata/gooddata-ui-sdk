// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { OnLoadingChanged, OnError } from "@gooddata/sdk-ui";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { LineChart } from "@gooddata/sdk-ui-charts";
import { IAttributeFilter, modifyMeasure, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

export const AttributeFilterExample: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Md.LocationResort, { uris: [] }),
    );

    const onLoadingChanged: OnLoadingChanged = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    const onError: OnError = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    return (
        <div className="s-attribute-filter">
            <AttributeFilter filter={filter} fullscreenOnMobile={false} onApply={setFilter} />
            <div style={{ height: 300 }} className="s-line-chart">
                <LineChart
                    measures={[TotalSales]}
                    trendBy={Md.LocationResort}
                    filters={filter ? [filter] : []}
                    onLoadingChanged={onLoadingChanged}
                    onError={onError}
                />
            </div>
        </div>
    );
};

export default AttributeFilterExample;
