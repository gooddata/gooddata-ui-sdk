// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { Table } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    locationStateDisplayFormIdentifier,
    numberOfRestaurantsIdentifier,
    totalSalesIdentifier,
} from "../utils/fixtures";

export class ArithmeticMeasureRatioExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("ArithmeticMeasureRatioExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("ArithmeticMeasureRatioExample onError", ...params);
    }

    render() {
        const localIdentifiers = {
            numberOfRestaurants: "numberOfRestaurants",
            totalSales: "totalSales",
            averageRestaurantSales: "averageRestaurantSales",
        };

        const measures = [
            newMeasure(
                numberOfRestaurantsIdentifier,
                m => m.format("#,##0"),
                localIdentifiers.numberOfRestaurants,
            ),
            newMeasure(totalSalesIdentifier, m => m.format("#,##0"), localIdentifiers.totalSales),
            newArithmeticMeasure(
                [localIdentifiers.numberOfRestaurants, localIdentifiers.totalSales],
                "ratio",
                m => m.format("#,##0").title("$ Avg State Daily Sales"),
                localIdentifiers.averageRestaurantSales,
            ),
        ];

        const attributes = [newAttribute(locationStateDisplayFormIdentifier)];

        return (
            <div style={{ height: 200 }} className="s-table">
                <Table
                    projectId={projectId}
                    measures={measures}
                    attributes={attributes}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                />
            </div>
        );
    }
}

export default ArithmeticMeasureRatioExample;
