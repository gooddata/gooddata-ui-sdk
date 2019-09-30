// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Heatmap, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    totalSalesIdentifier,
    menuCategoryAttributeDFIdentifier,
    locationStateDisplayFormIdentifier,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const totalSales = Model.measure(totalSalesIdentifier)
    .format("#,##0")
    .alias("$ Total Sales")
    .localIdentifier("totalSales");

const menuCategory = Model.attribute(menuCategoryAttributeDFIdentifier).localIdentifier("menuCategory");

const locationState = Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("locationState");

const style = { height: 300 };

export const HeatmapExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-heat-map">
            <Heatmap
                backend={backend}
                workspace={projectId}
                measure={totalSales}
                rows={locationState}
                columns={menuCategory}
            />
        </div>
    );
};
