// (C) 2007-2021 GoodData Corporation
import React from "react";
import { Heatmap } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";
import { Md } from "../../md";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));
const style = { height: 300 };

export const HeatmapExample: React.FC = () => {
    return (
        <div style={style} className="s-heat-map">
            <Heatmap measure={TotalSales} rows={Md.LocationState} columns={Md.MenuCategory} />
        </div>
    );
};
