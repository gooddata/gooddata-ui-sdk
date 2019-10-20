// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    locationStateDisplayFormIdentifier,
    numberOfRestaurantsIdentifier,
    averageRestaurantDailyCostsIdentifier,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

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

const rows = [newAttribute(locationStateDisplayFormIdentifier)];
const style = { height: 200 };

export const ArithmeticMeasureMultiplicationExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-table">
            <PivotTable backend={backend} workspace={projectId} measures={measures} rows={rows} />
        </div>
    );
};
