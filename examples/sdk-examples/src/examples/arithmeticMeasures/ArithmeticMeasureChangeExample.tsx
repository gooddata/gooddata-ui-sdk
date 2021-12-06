// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newPreviousPeriodMeasure, newArithmeticMeasure, newAbsoluteDateFilter } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

const totalSalesYearAgoBucketItem = newPreviousPeriodMeasure(
    MdExt.TotalSales1,
    [{ dataSet: Md.DateDatasets.Date.identifier, periodsAgo: 1 }],
    (m) => m.alias("$ Total Sales - year ago"),
);

const changeMeasure = newArithmeticMeasure([MdExt.TotalSales1, totalSalesYearAgoBucketItem], "change", (m) =>
    m.title("% Total Sales Change"),
);

const measures = [totalSalesYearAgoBucketItem, MdExt.TotalSales1, changeMeasure];

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
