// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ScatterPlot } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../md";

const xMeasure = LdmExt.FranchiseFees;

const yMeasure = LdmExt.FranchisedSales;

const style = { height: 300 };

export const ScatterPlotExample: React.FC = () => {
    return (
        <div style={style} className="s-scatter-plot">
            <ScatterPlot xAxisMeasure={xMeasure} yAxisMeasure={yMeasure} attribute={Ldm.LocationResort} />
        </div>
    );
};
