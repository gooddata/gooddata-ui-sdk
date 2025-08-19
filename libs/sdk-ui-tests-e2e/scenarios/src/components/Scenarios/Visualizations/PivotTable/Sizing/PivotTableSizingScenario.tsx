// (C) 2020-2025 GoodData Corporation
import React from "react";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";

import * as ReferenceMd from "../../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const measures = [ReferenceMd.Amount, ReferenceMd.Won];
const attributes = [ReferenceMd.Product.Name, ReferenceMd.Department];
const columns = [ReferenceMd.ForecastCategory, ReferenceMd.Region];

export const PivotTableSizingScenario: React.FC = () => {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return (
        <div
            style={{ width: 600, height: 300, marginTop: 20, resize: "both", overflow: "auto" }}
            className="s-pivot-table-sizing"
        >
            <PivotTable
                backend={backend}
                workspace={workspace}
                measures={measures}
                rows={attributes}
                columns={columns}
                config={{
                    columnSizing: {
                        defaultWidth: "autoresizeAll",
                        growToFit: true,
                    },
                }}
            />
        </div>
    );
};
