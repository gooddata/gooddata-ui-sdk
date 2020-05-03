// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import { newPopMeasure } from "@gooddata/sdk-model";

import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const totalSalesYearAgo = newPopMeasure(Ldm.$TotalSales, LdmExt.yearDateDataSetAttributeIdentifier, m =>
    m.alias("$ Total Sales - SP year ago"),
);

const style = { height: 300 };

export const SamePeriodColumnChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-column-chart">
            <ColumnChart
                backend={backend}
                workspace={workspace}
                measures={[Ldm.$TotalSales, totalSalesYearAgo]}
                viewBy={Ldm.DateQuarter}
            />
        </div>
    );
};
