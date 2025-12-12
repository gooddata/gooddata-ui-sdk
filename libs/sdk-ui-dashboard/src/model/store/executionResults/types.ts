// (C) 2021-2023 GoodData Corporation

import { type IExecutionResult } from "@gooddata/sdk-backend-spi";
import { type IResultWarning } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

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
