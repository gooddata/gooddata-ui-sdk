// (C) 2023 GoodData Corporation
import React from "react";
import { SankeyChart, IChartConfig } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));
const style = { height: 300 };

const config: IChartConfig = {
    separators: { decimal: ".", thousand: "," },
    legend: { position: "auto", enabled: true },
    dataLabels: { visible: "auto" },
};

export const SankeyChartExample: React.FC = () => {
    return (
        <div style={style} className="s-sankey-chart">
            <SankeyChart
                measure={TotalSales}
                attributeFrom={Md.MenuCategory}
                attributeTo={Md.LocationState}
                config={config}
            />
        </div>
    );
};
