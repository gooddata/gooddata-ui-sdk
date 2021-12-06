// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ScatterPlot } from "@gooddata/sdk-ui-charts";
import { Md, MdExt } from "../../md";

const xMeasure = MdExt.FranchiseFees;

const yMeasure = MdExt.FranchisedSales;

const style = { height: 300 };

export const ScatterPlotExample: React.FC = () => {
    return (
        <div style={style} className="s-scatter-plot">
            <ScatterPlot xAxisMeasure={xMeasure} yAxisMeasure={yMeasure} attribute={Md.LocationResort} />
        </div>
    );
};
