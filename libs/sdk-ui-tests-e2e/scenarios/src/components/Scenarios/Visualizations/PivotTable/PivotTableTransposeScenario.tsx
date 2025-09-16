// (C) 2023-2025 GoodData Corporation

import { IAttribute, IMeasure, IMeasureDefinition } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IPivotTableConfig, PivotTable } from "@gooddata/sdk-ui-pivot";

import * as ReferenceMd from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const measures = [ReferenceMd.Amount];
const attributes = [ReferenceMd.Product.Name];
const columns = [ReferenceMd.ForecastCategory];

export const transposeConfigWithRowLeft: IPivotTableConfig = {
    measureGroupDimension: "rows",
    columnHeadersPosition: "left",
};

const transposeConfigWithRowTop: IPivotTableConfig = {
    measureGroupDimension: "rows",
    columnHeadersPosition: "top",
};

export const transposeConfigWithColumnLeft: IPivotTableConfig = {
    measureGroupDimension: "columns",
    columnHeadersPosition: "left",
};

export const transposeConfigWithColumnTop: IPivotTableConfig = {
    measureGroupDimension: "columns",
    columnHeadersPosition: "top",
};

export const transposeConfigWithRow: IPivotTableConfig = {
    measureGroupDimension: "rows",
};

export const transposeConfigWithLeft: IPivotTableConfig = {
    columnHeadersPosition: "left",
};

export interface IPivotTableTransposeCoreProps {
    measure?: IMeasure<IMeasureDefinition>[] | undefined;
    row?: IAttribute[] | undefined;
    column?: IAttribute[] | undefined;
    config: IPivotTableConfig;
}

function PivotTableTranspose(props: IPivotTableTransposeCoreProps) {
    const { measure, row, column, config } = props;

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return (
        <div
            style={{ width: 1000, height: 300, marginTop: 20, resize: "both", overflow: "scroll" }}
            className="s-table-component-transpose"
        >
            <PivotTable
                backend={backend}
                workspace={workspace}
                measures={measure}
                rows={row}
                columns={column}
                config={config}
            />
        </div>
    );
}

export function PivotTableTransposeHasMR_RowLeft() {
    return (
        <PivotTableTranspose
            measure={measures}
            row={attributes}
            column={undefined}
            config={transposeConfigWithRowLeft}
        />
    );
}

export function PivotTableTransposeHasMR_RowTop() {
    return (
        <PivotTableTranspose
            measure={measures}
            row={attributes}
            column={undefined}
            config={transposeConfigWithRowTop}
        />
    );
}

export function PivotTableTransposeHasRC_RowLeft() {
    return (
        <PivotTableTranspose
            measure={undefined}
            row={attributes}
            column={columns}
            config={transposeConfigWithRowLeft}
        />
    );
}

export function PivotTableTransposeHasR_RowLeft() {
    return (
        <PivotTableTranspose
            measure={undefined}
            row={attributes}
            column={undefined}
            config={transposeConfigWithRowLeft}
        />
    );
}

export function PivotTableTransposeHasM_RowLeft() {
    return (
        <PivotTableTranspose
            measure={measures}
            row={undefined}
            column={undefined}
            config={transposeConfigWithRowLeft}
        />
    );
}

export function PivotTableTransposeHasC_Left() {
    return (
        <PivotTableTranspose
            measure={undefined}
            row={undefined}
            column={columns}
            config={transposeConfigWithLeft}
        />
    );
}
