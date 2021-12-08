// (C) 2007-2021 GoodData Corporation
import React from "react";

import { InsightView } from "@gooddata/sdk-ui-ext";
import { newAbsoluteDateFilter } from "@gooddata/sdk-model";
import { ExampleWithExport } from "./ExampleWithExport";
import { Md } from "../../md";

const filters = [newAbsoluteDateFilter(Md.DateDatasets.Date.ref, "2017-01-01", "2017-12-31")];

const style = { height: 300 };

export const insightViewColumnChartExportExample = (): JSX.Element => {
    return (
        <ExampleWithExport>
            {(onExportReady) => (
                <div style={style} className="s-insightView-chart">
                    <InsightView
                        insight={Md.Insights.PieChart}
                        filters={filters}
                        onExportReady={onExportReady}
                    />
                </div>
            )}
        </ExampleWithExport>
    );
};

export default insightViewColumnChartExportExample;
