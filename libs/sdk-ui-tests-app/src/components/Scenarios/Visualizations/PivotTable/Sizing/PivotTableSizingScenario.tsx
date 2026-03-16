// (C) 2020-2026 GoodData Corporation

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import * as ReferenceMd from "@gooddata/sdk-ui-tests-reference-workspace/current_bear";

const measures = [ReferenceMd.Amount, ReferenceMd.Won];
const attributes = [ReferenceMd.Product.Name, ReferenceMd.Department];
const columns = [ReferenceMd.ForecastCategory, ReferenceMd.Region];

export function PivotTableSizingScenario() {
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
}
