// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Kpi } from "@gooddata/sdk-ui";
import { newMeasure } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui/styles/css/main.css";

import { totalSalesIdentifier, projectId } from "../utils/fixtures";
import { useBackend } from "../backend";

const totalSales = newMeasure(totalSalesIdentifier);

export const KpiExample = () => {
    const backend = useBackend();

    return (
        <div className="kpi">
            <style jsx>{`
                .kpi {
                    margin: 10px 0;
                    font-size: 50px;
                    white-space: nowrap;
                    vertical-align: bottom;
                    text-align: center;
                    min-width: 300px;
                    line-height: 1.2em;
                    font-weight: 700;
                    width: 300px;
                }
            `}</style>
            <Kpi backend={backend} workspace={projectId} measure={totalSales} />
        </div>
    );
};
