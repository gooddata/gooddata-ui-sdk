// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newArithmeticMeasure } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

const averageStateDailyCosts = newArithmeticMeasure(
    [MdExt.NrRestaurants, MdExt.averageRestaurantDailyCosts],
    "multiplication",
    (m) => m.format("#,##0").title("$ Avg State Daily Costs"),
);

const measures = [MdExt.NrRestaurants, MdExt.averageRestaurantDailyCosts, averageStateDailyCosts];

const rows = [Md.LocationState];
const style = { height: 200 };

export const ArithmeticMeasureMultiplicationExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
