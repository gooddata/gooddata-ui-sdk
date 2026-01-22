// (C) 2019-2026 GoodData Corporation

import { type DependencyList } from "react";

import { type IExportConfig, type IPreparedExecution } from "@gooddata/sdk-backend-spi";

import { convertError } from "../base/errors/errorHandling.js";
import { type GoodDataSdkError } from "../base/errors/GoodDataSdkError.js";
import {
    type UseCancelablePromiseCallbacks,
    type UseCancelablePromiseState,
    useCancelablePromise,
} from "../base/react/useCancelablePromise.js";

/**
 * Indicates current state of useDataExport hook
 * @public
 */
export type UseDataExportState = UseCancelablePromiseState<string, GoodDataSdkError>;

/**
 * Callbacks for useDataExport hook
 * @public
 */
export type UseDataExportCallbacks = UseCancelablePromiseCallbacks<string, GoodDataSdkError>;

/**
 * This hook provides easy way to export data in your preferred format (csv/xlsx/raw) for the provided {@link @gooddata/sdk-backend-spi#IPreparedExecution}.
 *
 * @remarks
 * As a result, you will receive a string with uri, so you can easily create a download link.
 * Be aware that execution is re-executed only on dependency list change, not on execution/exportConfig/callbacks change.
 *
 * @public
 */
export function useDataExport(
    {
        execution,
        exportConfig = {},
        onCancel,
        onError,
        onLoading,
        onPending,
        onSuccess,
    }: {
        execution: IPreparedExecution | undefined | null;
        exportConfig?: IExportConfig;
    } & UseDataExportCallbacks,
    deps?: DependencyList,
): UseDataExportState {
    return useCancelablePromise<string, GoodDataSdkError>(
        {
            promise: execution
                ? () =>
                      execution
                          .execute()
                          .then((executionResult) => executionResult.export(exportConfig))
                          .then((exportResult) => {
                              return exportResult.uri;
                          })
                          .catch((error) => {
                              throw convertError(error);
                          })
                : null,
            onCancel,
            onError,
            onLoading,
            onPending,
            onSuccess,
        },
        deps,
    );
}
