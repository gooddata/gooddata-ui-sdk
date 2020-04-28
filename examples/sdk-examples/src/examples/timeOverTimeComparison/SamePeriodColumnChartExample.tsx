// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newMeasure, newAttribute, newPopMeasure } from "@gooddata/sdk-model";

import {
    totalSalesIdentifier,
    quarterDateIdentifier,
    yearDateDataSetAttributeIdentifier,
    projectId,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const totalSales = newMeasure(totalSalesIdentifier, m => m.alias("$ Total Sales"));
const totalSalesYearAgo = newPopMeasure(
    totalSales.measure.localIdentifier,
    yearDateDataSetAttributeIdentifier,
    m => m.alias("$ Total Sales - SP year ago"),
);
const viewBy = newAttribute(quarterDateIdentifier);

const style = { height: 300 };

export const SamePeriodColumnChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-column-chart">
            <ColumnChart
                backend={backend}
                workspace={projectId}
                measures={[totalSales, totalSalesYearAgo]}
                viewBy={viewBy}
            />
        </div>
    );
};
