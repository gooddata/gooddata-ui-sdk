// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Heatmap } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    totalSalesIdentifier,
    menuCategoryAttributeDFIdentifier,
    locationStateDisplayFormIdentifier,
} from "../utils/fixtures";
import { useBackend } from "../context/auth";

const totalSales = newMeasure(totalSalesIdentifier, m => m.format("#,##0").alias("$ Total Sales"));

const menuCategory = newAttribute(menuCategoryAttributeDFIdentifier);

const locationState = newAttribute(locationStateDisplayFormIdentifier);

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
