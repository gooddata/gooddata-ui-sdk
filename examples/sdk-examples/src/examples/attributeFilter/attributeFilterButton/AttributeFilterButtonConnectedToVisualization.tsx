// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { IAttributeFilter, modifyMeasure, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

export const AttributeFilterButtonConnectedToVisualization: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>(
        newNegativeAttributeFilter(Md.LocationResort, { uris: [] }),
    );

    return (
        <div className="s-attribute-filter">
            <AttributeFilterButton filter={filter} onApply={setFilter} />
            <div style={{ height: 300 }}>
                <ColumnChart
                    measures={[TotalSales]}
                    viewBy={Md.LocationResort}
                    filters={filter ? [filter] : []}
                />
            </div>
        </div>
    );
};

export default AttributeFilterButtonConnectedToVisualization;
