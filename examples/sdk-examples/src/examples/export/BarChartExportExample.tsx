// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { newAttribute, newMeasure, newAbsoluteDateFilter } from "@gooddata/sdk-model";

import { ExampleWithExport } from "./ExampleWithExport";
import {
    dateDatasetIdentifier,
    locationResortIdentifier,
    workspace,
    totalSalesIdentifier,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const measures = [newMeasure(totalSalesIdentifier, m => m.format("#,##0").alias("$ Total Sales"))];
const locationResort = newAttribute(locationResortIdentifier);
const filters = [newAbsoluteDateFilter(dateDatasetIdentifier, "2017-01-01", "2017-12-31")];

const style = { height: 300 };

export const BarChartExportExample: React.FC = () => {
    const backend = useBackend();
    return (
        <ExampleWithExport filters={filters}>
            {onExportReady => (
                <div style={style} className="s-bar-chart">
                    <BarChart
                        backend={backend}
                        workspace={workspace}
                        measures={measures}
                        viewBy={locationResort}
                        filters={filters}
                        onExportReady={onExportReady}
                    />
                </div>
            )}
        </ExampleWithExport>
    );
};
