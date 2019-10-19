// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui";
import {
    newAttribute,
    newMeasure,
    newPreviousPeriodMeasure,
    newArithmeticMeasure,
    newAbsoluteDateFilter,
} from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    projectId,
    monthDateIdentifier,
    totalSalesIdentifier,
    dateDatasetIdentifier,
} from "../utils/fixtures";
import { useBackend } from "../context/auth";

const totalSalesBucketItem = newMeasure(totalSalesIdentifier, m => m.alias("$ Total Sales"));

const totalSalesYearAgoBucketItem = newPreviousPeriodMeasure(
    totalSalesBucketItem.measure.localIdentifier,
    [{ dataSet: dateDatasetIdentifier, periodsAgo: 1 }],
    m => m.alias("$ Total Sales - year ago"),
);

const changeMeasure = newArithmeticMeasure(
    [totalSalesBucketItem.measure.localIdentifier, totalSalesYearAgoBucketItem.measure.localIdentifier],
    "change",
    m => m.title("% Total Sales Change"),
);

const measures = [totalSalesYearAgoBucketItem, totalSalesBucketItem, changeMeasure];

const rows = [newAttribute(monthDateIdentifier)];

const filters = [newAbsoluteDateFilter(dateDatasetIdentifier, "2017-01-01", "2017-12-31")];

const style = { height: 200 };

export const ArithmeticMeasureChangeExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-table">
            <PivotTable
                backend={backend}
                workspace={projectId}
                measures={measures}
                filters={filters}
                rows={rows}
            />
        </div>
    );
};
