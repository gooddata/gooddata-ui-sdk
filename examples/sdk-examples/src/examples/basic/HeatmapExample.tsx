// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Heatmap } from "@gooddata/sdk-ui-charts";
import { Md, MdExt } from "../../md";

const style = { height: 300 };

export const HeatmapExample: React.FC = () => {
    return (
        <div style={style} className="s-heat-map">
            <Heatmap measure={MdExt.TotalSales1} rows={Md.LocationState} columns={Md.MenuCategory} />
        </div>
    );
};
