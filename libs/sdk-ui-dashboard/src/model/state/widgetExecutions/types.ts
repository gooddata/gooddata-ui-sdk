// (C) 2021 GoodData Corporation

import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export interface IWidgetExecution {
    widgetRef: ObjRef;
    isLoading: boolean;
    executionResult?: IExecutionResult;
    error?: GoodDataSdkError;
}
