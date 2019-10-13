// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { Table } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

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
            newMeasure(numberOfRestaurantsIdentifier, m =>
                m.format("#,##0").localId(localIdentifiers.numberOfRestaurants),
            ),
            newMeasure(averageRestaurantDailyCostsIdentifier, m =>
                m.format("#,##0").localId(localIdentifiers.averageRestaurantDailyCosts),
            ),
            newArithmeticMeasure(
                [localIdentifiers.numberOfRestaurants, localIdentifiers.averageRestaurantDailyCosts],
                "multiplication",
                m =>
                    m
                        .format("#,##0")
                        .title("$ Avg State Daily Costs")
                        .localId(localIdentifiers.averageStateDailyCosts),
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

export default ArithmeticMeasureMultiplicationExample;
