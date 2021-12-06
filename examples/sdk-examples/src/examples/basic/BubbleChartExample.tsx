// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BubbleChart } from "@gooddata/sdk-ui-charts";
import { Md, MdExt } from "../../md";

const xMeasure = MdExt.FranchiseFees;

const yMeasure = MdExt.FranchisedSales;

const style = { height: 300 };

export const BubbleChartExample: React.FC = () => {
    return (
        <div style={style} className="s-bubble-chart">
            <BubbleChart
                xAxisMeasure={xMeasure}
                yAxisMeasure={yMeasure}
                viewBy={Md.LocationResort}
                size={Md.AvgCheckSizeByServer}
            />
        </div>
    );
};
