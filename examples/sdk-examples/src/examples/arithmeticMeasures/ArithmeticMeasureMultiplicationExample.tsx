// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newArithmeticMeasure } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

const averageStateDailyCosts = newArithmeticMeasure(
    [LdmExt.NrRestaurants, LdmExt.averageRestaurantDailyCosts],
    "multiplication",
    (m) => m.format("#,##0").title("$ Avg State Daily Costs"),
);

const measures = [LdmExt.NrRestaurants, LdmExt.averageRestaurantDailyCosts, averageStateDailyCosts];

const rows = [Ldm.LocationState];
const style = { height: 200 };

export const ArithmeticMeasureMultiplicationExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
