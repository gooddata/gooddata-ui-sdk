// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { newAbsoluteDateFilter } from "@gooddata/sdk-model";

import { ExampleWithExport } from "./ExampleWithExport";
import { workspace } from "../../constants/fixtures";
import { Ldm, LdmExt } from "../../ldm";
import { useBackend } from "../../context/auth";

const measures = [LdmExt.TotalSales1];
const filters = [newAbsoluteDateFilter(LdmExt.dateDatasetIdentifier, "2017-01-01", "2017-12-31")];

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
                        viewBy={Ldm.LocationResort}
                        filters={filters}
                        onExportReady={onExportReady}
                    />
                </div>
            )}
        </ExampleWithExport>
    );
};
