// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { modifyMeasure, newArithmeticMeasure, newMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const averageRestaurantDailyCostsIdentifier = "aaQJzQzoeKwZ";
const NrRestaurants = modifyMeasure(Md.NrRestaurants, (m) =>
    m.format("#,##0").localId("numberOfRestaurants"),
);
const averageRestaurantDailyCosts = newMeasure(averageRestaurantDailyCostsIdentifier, (m) =>
    m.format("#,##0").localId("averageRestaurantDailyCosts"),
);

const averageStateDailyCosts = newArithmeticMeasure(
    [NrRestaurants, averageRestaurantDailyCosts],
    "multiplication",
    (m) => m.format("#,##0").title("$ Avg State Daily Costs"),
);

const measures = [NrRestaurants, averageRestaurantDailyCosts, averageStateDailyCosts];

const rows = [Md.LocationState];
const style = { height: 200 };

export const ArithmeticMeasureMultiplicationExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
