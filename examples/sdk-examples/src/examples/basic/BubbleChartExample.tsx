// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BubbleChart } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../md";

const xMeasure = LdmExt.FranchiseFees;

const yMeasure = LdmExt.FranchisedSales;

const style = { height: 300 };

export const BubbleChartExample: React.FC = () => {
    return (
        <div style={style} className="s-bubble-chart">
            <BubbleChart
                xAxisMeasure={xMeasure}
                yAxisMeasure={yMeasure}
                viewBy={Ldm.LocationResort}
                size={Ldm.AvgCheckSizeByServer}
            />
        </div>
    );
};
