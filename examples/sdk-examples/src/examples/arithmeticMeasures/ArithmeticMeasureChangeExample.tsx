// (C) 2007-2021 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    newPreviousPeriodMeasure,
    newArithmeticMeasure,
    newAbsoluteDateFilter,
    modifyMeasure,
} from "@gooddata/sdk-model";
import { Md } from "../../md";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));

const totalSalesYearAgoBucketItem = newPreviousPeriodMeasure(
    TotalSales,
    [{ dataSet: Md.DateDatasets.Date.identifier, periodsAgo: 1 }],
    (m) => m.alias("$ Total Sales - year ago"),
);

const changeMeasure = newArithmeticMeasure([TotalSales, totalSalesYearAgoBucketItem], "change", (m) =>
    m.title("% Total Sales Change"),
);

const measures = [totalSalesYearAgoBucketItem, TotalSales, changeMeasure];

const rows = [Md.DateMonth.Short];

const filters = [newAbsoluteDateFilter(Md.DateDatasets.Date.ref, "2017-01-01", "2017-12-31")];

const style = { height: 200 };

export const ArithmeticMeasureChangeExample: React.FC = () => {
    return (
        <div style={style} className="s-table">
            <PivotTable measures={measures} filters={filters} rows={rows} />
        </div>
    );
};
