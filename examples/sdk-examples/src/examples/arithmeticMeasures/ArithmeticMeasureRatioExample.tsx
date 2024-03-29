// (C) 2007-2022 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { modifyMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);
const NrRestaurants = modifyMeasure(Md.NrRestaurants, (m) => m.format("#,##0"));
const averageRestaurantSales = newArithmeticMeasure([TotalSales, NrRestaurants], "ratio", (m) =>
    m.format("#,##0").title("$ Avg State Daily Sales"),
);

const measures = [TotalSales, NrRestaurants, averageRestaurantSales];

const rows = [Md.LocationState];
const style = { height: 200 };

export const ArithmeticMeasureRatioExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} rows={rows} />
        </div>
    );
};
