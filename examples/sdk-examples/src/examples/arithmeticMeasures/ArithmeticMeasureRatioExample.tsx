// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newAttribute, newMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";

import {
    workspace,
    locationStateDisplayFormIdentifier,
    numberOfRestaurantsIdentifier,
    totalSalesIdentifier,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const localIdentifiers = {
    numberOfRestaurants: "numberOfRestaurants",
    totalSales: "totalSales",
    averageRestaurantSales: "averageRestaurantSales",
    locationState: "locationState",
};

const measures = [
    newMeasure(numberOfRestaurantsIdentifier, m =>
        m.format("#,##0").localId(localIdentifiers.numberOfRestaurants),
    ),
    newMeasure(totalSalesIdentifier, m => m.format("#,##0").localId(localIdentifiers.totalSales)),
    newArithmeticMeasure([localIdentifiers.numberOfRestaurants, localIdentifiers.totalSales], "ratio", m =>
        m
            .format("#,##0")
            .title("$ Avg State Daily Sales")
            .localId(localIdentifiers.averageRestaurantSales),
    ),
];

const rows = [newAttribute(locationStateDisplayFormIdentifier)];
const style = { height: 200 };

export const ArithmeticMeasureRatioExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-table">
            <PivotTable backend={backend} workspace={workspace} measures={measures} rows={rows} />
        </div>
    );
};
