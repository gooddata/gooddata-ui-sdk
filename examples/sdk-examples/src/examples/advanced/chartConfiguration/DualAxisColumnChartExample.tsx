// (C) 2007-2022 GoodData Corporation
import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import * as Md from "../../../md/full";
import { measureLocalId, modifyMeasure } from "@gooddata/sdk-model";

const TotalCosts = modifyMeasure(Md.$TotalCosts, (m) => m.format("#,##0").alias("$ Total Costs"));
const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

const config = {
    secondary_yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "-75000000",
        max: "75000000",
        measures: [measureLocalId(TotalCosts)],
    },
    yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "-75000000",
        max: "75000000",
        measures: [measureLocalId(TotalSales)],
    },
};

export const DualAxisColumnChartExample: React.FC = () => {
    return (
        <div style={{ height: 300 }} className="s-dual-axis-column-chart">
            <ColumnChart measures={[TotalCosts, TotalSales]} viewBy={Md.LocationState} config={config} />
        </div>
    );
};
