// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { Table, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    locationStateDisplayFormIdentifier,
    numberOfRestaurantsIdentifier,
    averageRestaurantDailyCostsIdentifier,
} from "../utils/fixtures";

export class ArithmeticMeasureMultiplicationExample extends Component {
    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        return console.log("ArithmeticMeasureMultiplicationExample onLoadingChanged", ...params);
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        return console.log("ArithmeticMeasureMultiplicationExample onError", ...params);
    }

    render() {
        const localIdentifiers = {
            numberOfRestaurants: "numberOfRestaurants",
            averageRestaurantDailyCosts: "averageRestaurantDailyCosts",
            averageStateDailyCosts: "averageStateDailyCosts",
        };

        const measures = [
            Model.measure(numberOfRestaurantsIdentifier)
                .localIdentifier(localIdentifiers.numberOfRestaurants)
                .format("#,##0"),
            Model.measure(averageRestaurantDailyCostsIdentifier)
                .localIdentifier(localIdentifiers.averageRestaurantDailyCosts)
                .format("#,##0"),
            Model.arithmeticMeasure(
                [localIdentifiers.numberOfRestaurants, localIdentifiers.averageRestaurantDailyCosts],
                "multiplication",
            )
                .localIdentifier(localIdentifiers.averageStateDailyCosts)
                .format("#,##0")
                .title("$ Avg State Daily Costs"),
        ];

        const attributes = [Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("month")];

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

export default ArithmeticMeasureMultiplicationExample;
