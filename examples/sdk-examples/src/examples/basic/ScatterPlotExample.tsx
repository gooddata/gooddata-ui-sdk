// (C) 2007-2021 GoodData Corporation
import React from "react";
import { ScatterPlot } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const FranchiseFees = modifyMeasure(Md.$FranchiseFees, (m) =>
    m.format("#,##0").localId("franchiseFees").title("Franchise Fees"),
);
const FranchisedSales = modifyMeasure(Md.$FranchisedSales, (m) =>
    m.format("#,##0").title("Franchise Sales").localId("franchiseSales"),
);

const style = { height: 300 };

export const ScatterPlotExample: React.FC = () => {
    return (
        <div style={style} className="s-scatter-plot">
            <ScatterPlot
                xAxisMeasure={FranchiseFees}
                yAxisMeasure={FranchisedSales}
                attribute={Md.LocationResort}
            />
        </div>
    );
};
