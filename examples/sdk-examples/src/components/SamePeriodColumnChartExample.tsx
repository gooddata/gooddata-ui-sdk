// (C) 2007-2019 GoodData Corporation

import React from "react";
import { ColumnChart } from "@gooddata/sdk-ui";
import { newMeasure, newAttribute, newPopMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import {
    totalSalesIdentifier,
    quarterDateIdentifier,
    yearDateDataSetAttributeIdentifier,
    projectId,
} from "../utils/fixtures";
import { useBackend } from "../backend";

const style = { height: 300 };

export const SamePeriodColumnChartExample: React.FC = () => {
    const backend = useBackend();

    return (
        <div style={style} className="s-column-chart">
            <ColumnChart
                backend={backend}
                workspace={projectId}
                measures={[
                    newPopMeasure("totalSales", yearDateDataSetAttributeIdentifier, m =>
                        m.alias("$ Total Sales - SP year ago"),
                    ),
                    newMeasure(totalSalesIdentifier, m => m.alias("$ Total Sales")),
                ]}
                viewBy={newAttribute(quarterDateIdentifier)}
            />
        </div>
    );
};
