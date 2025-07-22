// (C) 2025 GoodData Corporation
import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    useBackendStrict,
    useWorkspaceStrict,
    useCancelablePromise,
    GoodDataSdkError,
} from "@gooddata/sdk-ui";
import { getExecutionProps, getMeasureGroupDimension } from "../mapProps/props.js";
import { getExecution } from "../execution/getExecution.js";
import { IPivotTableNextProps } from "../types/public.js";

/**
 * @alpha
 */
export const useInitExecution = (props: IPivotTableNextProps) => {
    const backend = useBackendStrict(props.backend, "useInitExecution");
    const workspace = useWorkspaceStrict(props.workspace, "useInitExecution");
    const measureGroupDimension = getMeasureGroupDimension(props);
    const { columns, rows, measures, filters, sortBy, totals } = getExecutionProps(props);

    return useCancelablePromise<IExecutionResult, GoodDataSdkError>(
        {
            promise: (signal) =>
                getExecution({
                    backend,
                    workspace,
                    columns,
                    rows,
                    measures,
                    filters,
                    sortBy,
                    totals,
                    measureGroupDimension,
                    signal,
                }),
            enableAbortController: true,
        },
        [backend, workspace, columns, rows, measures, measureGroupDimension, sortBy],
    );
};
