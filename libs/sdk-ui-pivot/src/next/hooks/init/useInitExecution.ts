// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useInitialProp } from "@gooddata/sdk-ui/internal";

import { applyPivotTableDefaultProps } from "../../context/PivotTablePropsContext.js";
import { createExecutionDef } from "../../features/data/createExecutionDef.js";
import { ICorePivotTableNextProps } from "../../types/internal.js";
import { IPivotTableNextProps } from "../../types/public.js";

/**
 * Initializes execution for pivot table.
 *
 * @internal
 */
export const useInitExecution = (props: IPivotTableNextProps) => {
    const backend = useBackendStrict(props.backend, "useInitExecution");
    const workspace = useWorkspaceStrict(props.workspace, "useInitExecution");

    const {
        columns,
        rows,
        measures,
        filters,
        sortBy,
        totals,
        config: { measureGroupDimension },
        execConfig,
    } = applyPivotTableDefaultProps(props as ICorePivotTableNextProps);

    const initialSortBy = useInitialProp(sortBy);

    return useMemo(() => {
        return backend
            .workspace(workspace)
            .execution()
            .forDefinition(
                createExecutionDef({
                    workspace,
                    columns,
                    rows,
                    measures,
                    filters,
                    sortBy: initialSortBy,
                    totals,
                    measureGroupDimension,
                    execConfig,
                }),
            );
    }, [
        backend,
        workspace,
        columns,
        rows,
        measures,
        filters,
        initialSortBy,
        totals,
        measureGroupDimension,
        execConfig,
    ]);
};
