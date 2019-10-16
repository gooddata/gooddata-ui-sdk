// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import { totalSalesIdentifier, monthDateIdentifier, projectId } from "../utils/fixtures";
import { useBackend } from "../context/auth";

const totalSales = newMeasure(totalSalesIdentifier, m => m.format("#,##0").alias("$ Total Sales"));

const month = newAttribute(monthDateIdentifier);

const style = { height: 300 };

export const ColumnChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-column-chart">
            <ColumnChart backend={backend} workspace={projectId} measures={[totalSales]} viewBy={month} />
        </div>
    );
};
