// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newArithmeticMeasure } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

const averageRestaurantSales = newArithmeticMeasure([MdExt.TotalSales2, MdExt.NrRestaurants], "ratio", (m) =>
    m.format("#,##0").title("$ Avg State Daily Sales"),
);

const measures = [MdExt.TotalSales2, MdExt.NrRestaurants, averageRestaurantSales];

const rows = [Md.LocationState];
const style = { height: 200 };

export const ArithmeticMeasureRatioExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
