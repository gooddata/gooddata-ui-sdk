// (C) 2007-2022 GoodData Corporation
import React from "react";
import { BubbleChart } from "@gooddata/sdk-ui-charts";
import * as Md from "../../md/full";
import { modifyMeasure } from "@gooddata/sdk-model";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) => m.format("#,##0").title("Franchise Fees"));
const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) => m.format("#,##0").title("Franchise Sales"));

const style = { height: 300 };

export const BubbleChartExample: React.FC = () => {
    return (
        <div style={style} className="s-bubble-chart">
            <BubbleChart
                xAxisMeasure={FranchiseFees}
                yAxisMeasure={FranchisedSales}
                viewBy={Md.LocationResort}
                size={Md.AvgCheckSizeByServer}
            />
        </div>
    );
};
