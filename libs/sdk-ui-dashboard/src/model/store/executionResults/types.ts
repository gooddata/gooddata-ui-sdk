// (C) 2021-2023 GoodData Corporation

import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { IResultWarning } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @beta
 */
export interface IExecutionResultEnvelope {
    id: string;
    isLoading: boolean;
    executionResult?: IExecutionResult;
    error?: GoodDataSdkError;
    warnings?: IResultWarning[];
}
