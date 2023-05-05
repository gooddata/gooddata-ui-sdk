// (C) 2023 GoodData Corporation
import React from "react";
import { WaterfallChart } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";

import * as Md from "../../md/full";

const TotalSales = [modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"))];
const style = { height: 300 };

export const WaterfallChartExample: React.FC = () => {
    return (
        <div style={style} className="s-waterfall-chart">
            <WaterfallChart measures={TotalSales} viewBy={Md.LocationResort} />
        </div>
    );
};
