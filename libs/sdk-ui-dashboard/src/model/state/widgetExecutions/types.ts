// (C) 2021 GoodData Corporation

import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IWidgetExecution {
    widgetRef: ObjRef;
    isLoading: boolean;
    executionResult?: IExecutionResult;
    error?: Error;
}
