// (C) 2023-2025 GoodData Corporation

import { IAttribute, IMeasure, IMeasureDefinition } from "@gooddata/sdk-model";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import { PivotTableNext, PivotTableNextConfig } from "@gooddata/sdk-ui-pivot";

import * as ReferenceMd from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";

const measures = [ReferenceMd.Amount];
const attributes = [ReferenceMd.Product.Name];
const columns = [ReferenceMd.ForecastCategory];

export const transposeConfigWithRowLeft: PivotTableNextConfig = {
    measureGroupDimension: "rows",
    columnHeadersPosition: "left",
};

const transposeConfigWithRowTop: PivotTableNextConfig = {
    measureGroupDimension: "rows",
    columnHeadersPosition: "top",
};

export const transposeConfigWithColumnLeft: PivotTableNextConfig = {
    measureGroupDimension: "columns",
    columnHeadersPosition: "left",
};

export const transposeConfigWithColumnTop: PivotTableNextConfig = {
    measureGroupDimension: "columns",
    columnHeadersPosition: "top",
};

export const transposeConfigWithRow: PivotTableNextConfig = {
    measureGroupDimension: "rows",
};

export const transposeConfigWithLeft: PivotTableNextConfig = {
    columnHeadersPosition: "left",
};

export interface IPivotTableTransposeCoreProps {
    measure?: IMeasure<IMeasureDefinition>[] | undefined;
    row?: IAttribute[] | undefined;
    column?: IAttribute[] | undefined;
    config?: PivotTableNextConfig;
}

function PivotTableTranspose({ measure, row, column, config }: IPivotTableTransposeCoreProps) {
    return (
        <div
            style={{ width: 1000, height: 300, marginTop: 20, resize: "both", overflow: "scroll" }}
            className="s-table-component-transpose"
        >
            <PivotTableNext measures={measure} rows={row} columns={column} config={config} />
        </div>
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

export function PivotTableTransposeHasRC_RowTop() {
    return (
        <PivotTableTranspose
            measure={undefined}
            row={attributes}
            column={columns}
            config={transposeConfigWithRowTop}
        />
    );
}

export function PivotTableTransposeHasR_RowTop() {
    return (
        <PivotTableTranspose
            measure={undefined}
            row={attributes}
            column={undefined}
            config={transposeConfigWithRowTop}
        />
    );
}

export function PivotTableTransposeHasM_RowTop() {
    return (
        <PivotTableTranspose
            measure={measures}
            row={undefined}
            column={undefined}
            config={transposeConfigWithRowTop}
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
