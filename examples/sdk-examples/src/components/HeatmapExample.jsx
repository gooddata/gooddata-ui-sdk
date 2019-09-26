// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Heatmap, Model } from "@gooddata/sdk-ui";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    totalSalesIdentifier,
    menuCategoryAttributeDFIdentifier,
    locationStateDisplayFormIdentifier,
} from "../utils/fixtures";

export class HeatmapExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info("HeatmapExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info("HeatmapExample onLoadingChanged", ...params);
    }

    render() {
        const totalSales = Model.measure(totalSalesIdentifier)
            .format("#,##0")
            .alias("$ Total Sales")
            .localIdentifier("totalSales");

        const menuCategory = Model.attribute(menuCategoryAttributeDFIdentifier).localIdentifier(
            "menuCategory",
        );

        const locationState = Model.attribute(locationStateDisplayFormIdentifier).localIdentifier(
            "locationState",
        );

        return (
            <div style={{ height: 300 }} className="s-heat-map">
                <Heatmap
                    projectId={projectId}
                    measure={totalSales}
                    rows={locationState}
                    columns={menuCategory}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default HeatmapExample;
