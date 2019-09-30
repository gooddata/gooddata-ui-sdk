// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    totalSalesIdentifier,
    quarterDateIdentifier,
    yearDateDataSetAttributeIdentifier,
    projectId,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const style = { height: 300 };

export const SamePeriodColumnChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-column-chart">
            <ColumnChart
                backend={backend}
                workspace={projectId}
                measures={[
                    Model.popMeasure("totalSales", yearDateDataSetAttributeIdentifier)
                        .localIdentifier("totalSalesPeriod")
                        .alias("$ Total Sales - SP year ago"),
                    Model.measure(totalSalesIdentifier)
                        .localIdentifier("totalSales")
                        .alias("$ Total Sales"),
                ]}
                viewBy={Model.attribute(quarterDateIdentifier).localIdentifier("quarter")}
            />
        </div>
    );
};
