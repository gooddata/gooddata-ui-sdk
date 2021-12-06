// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newArithmeticMeasure } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

const averageRestaurantSales = newArithmeticMeasure(
    [LdmExt.TotalSales2, LdmExt.NrRestaurants],
    "ratio",
    (m) => m.format("#,##0").title("$ Avg State Daily Sales"),
);

const measures = [LdmExt.TotalSales2, LdmExt.NrRestaurants, averageRestaurantSales];

const rows = [Ldm.LocationState];
const style = { height: 200 };

export const ArithmeticMeasureRatioExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
