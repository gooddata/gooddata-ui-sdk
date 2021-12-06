// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Heatmap } from "@gooddata/sdk-ui-charts";
import { Ldm, LdmExt } from "../../md";

const style = { height: 300 };

export const HeatmapExample: React.FC = () => {
    return (
        <div style={style} className="s-heat-map">
            <Heatmap measure={LdmExt.TotalSales1} rows={Ldm.LocationState} columns={Ldm.MenuCategory} />
        </div>
    );
};
