// (C) 2007-2019 GoodData Corporation
import React from "react";
import { newAbsoluteDateFilter } from "@gooddata/sdk-model";

import { ExampleWithExport } from "./ExampleWithExport";
import { Ldm, LdmExt } from "../../md";
import { Execute, ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";

const primaryMeasure = LdmExt.FranchiseFees;
const filters = [newAbsoluteDateFilter(Ldm.DateDatasets.Date, "2017-01-01", "2017-12-31")];

export const ExecuteExportExample: React.FC = () => {
    return (
        <ExampleWithExport filters={filters}>
            {(onExportReady) => {
                return (
                    <div>
                        <Execute seriesBy={[primaryMeasure]} onExportReady={onExportReady} filters={filters}>
                            {({ error, isLoading, result }) => {
                                if (error) {
                                    return (
                                        <div>
                                            <ErrorComponent message="There was an error getting your execution" />
                                        </div>
                                    );
                                }
                                if (isLoading || !result) {
                                    return (
                                        <div>
                                            <div className="gd-message progress">
                                                <div className="gd-message-text">Loading…</div>
                                            </div>
                                            <LoadingComponent />
                                        </div>
                                    );
                                }

                                const measureSeries = result.data().series().firstForMeasure(primaryMeasure);

                                return (
                                    <div>
                                        <style jsx>
                                            {`
                                                .kpi {
                                                    height: 60px;
                                                    margin: 10px 0;
                                                    font-size: 50px;
                                                    line-height: 60px;
                                                    white-space: nowrap;
                                                    vertical-align: bottom;
                                                    font-weight: 700;
                                                }
                                            `}
                                        </style>
                                        <p className="kpi s-execute-kpi">
                                            {measureSeries.dataPoints()[0].formattedValue()}
                                        </p>
                                    </div>
                                );
                            }}
                        </Execute>
                    </div>
                );
            }}
        </ExampleWithExport>
    );
};

export default ExecuteExportExample;
