// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { newPreviousPeriodMeasure, newArithmeticMeasure, newAbsoluteDateFilter } from "@gooddata/sdk-model";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const totalSalesYearAgoBucketItem = newPreviousPeriodMeasure(
    LdmExt.TotalSales1,
    [{ dataSet: LdmExt.dateDatasetIdentifier, periodsAgo: 1 }],
    m => m.alias("$ Total Sales - year ago"),
);

const changeMeasure = newArithmeticMeasure([LdmExt.TotalSales1, totalSalesYearAgoBucketItem], "change", m =>
    m.title("% Total Sales Change"),
);

const measures = [totalSalesYearAgoBucketItem, LdmExt.TotalSales1, changeMeasure];

const rows = [Ldm.DateMonth.Short];

const filters = [newAbsoluteDateFilter(LdmExt.dateDatasetIdentifier, "2017-01-01", "2017-12-31")];

const style = { height: 200 };

export const ArithmeticMeasureChangeExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-table">
            <PivotTable
                backend={backend}
                workspace={workspace}
                measures={measures}
                filters={filters}
                rows={rows}
            />
        </div>
    );
};
