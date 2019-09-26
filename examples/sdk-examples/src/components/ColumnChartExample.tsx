// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import { totalSalesIdentifier, monthDateIdentifier, projectId } from "../utils/fixtures";
import { useBackend } from "../backend";

const totalSales = Model.measure(totalSalesIdentifier)
    .format("#,##0")
    .alias("$ Total Sales")
    .localIdentifier("totalSales");

const month = Model.attribute(monthDateIdentifier).localIdentifier("month");

const style = { height: 300 };

export const ColumnChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-column-chart">
            <ColumnChart backend={backend} workspace={projectId} measures={[totalSales]} viewBy={month} />
        </div>
    );
};
