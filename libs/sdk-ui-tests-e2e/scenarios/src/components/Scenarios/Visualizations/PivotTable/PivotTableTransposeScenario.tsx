// (C) 2023 GoodData Corporation
import React from "react";
import { IPivotTableConfig, PivotTable } from "@gooddata/sdk-ui-pivot";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import * as ReferenceMd from "../../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger";
import { IAttribute, IMeasure, IMeasureDefinition } from "@gooddata/sdk-model";

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

const PivotTableTranspose: React.FC<IPivotTableTransposeCoreProps> = (props) => {
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
};

export const PivotTableTransposeHasMR_RowLeft = () => {
    return (
        <PivotTableTranspose
            measure={measures}
            row={attributes}
            column={undefined}
            config={transposeConfigWithRowLeft}
        />
    );
};

export const PivotTableTransposeHasMR_RowTop = () => {
    return (
        <PivotTableTranspose
            measure={measures}
            row={attributes}
            column={undefined}
            config={transposeConfigWithRowTop}
        />
    );
};

export const PivotTableTransposeHasRC_RowLeft = () => {
    return (
        <PivotTableTranspose
            measure={undefined}
            row={attributes}
            column={columns}
            config={transposeConfigWithRowLeft}
        />
    );
};

export const PivotTableTransposeHasR_RowLeft = () => {
    return (
        <PivotTableTranspose
            measure={undefined}
            row={attributes}
            column={undefined}
            config={transposeConfigWithRowLeft}
        />
    );
};

export const PivotTableTransposeHasM_RowLeft = () => {
    return (
        <PivotTableTranspose
            measure={measures}
            row={undefined}
            column={undefined}
            config={transposeConfigWithRowLeft}
        />
    );
};

export const PivotTableTransposeHasC_Left = () => {
    return (
        <PivotTableTranspose
            measure={undefined}
            row={undefined}
            column={columns}
            config={transposeConfigWithLeft}
        />
    );
};
