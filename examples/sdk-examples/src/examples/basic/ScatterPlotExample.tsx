// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ScatterPlot } from "@gooddata/sdk-ui-charts";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const xMeasure = LdmExt.FranchiseFees;

const yMeasure = LdmExt.FranchisedSales;

const style = { height: 300 };

export const ScatterPlotExample: React.FC = () => {
    const backend = useBackend();
    return (
        <div style={style} className="s-scatter-plot">
            <ScatterPlot
                backend={backend}
                workspace={workspace}
                xAxisMeasure={xMeasure}
                yAxisMeasure={yMeasure}
                attribute={Ldm.LocationResort}
            />
        </div>
    );
};
