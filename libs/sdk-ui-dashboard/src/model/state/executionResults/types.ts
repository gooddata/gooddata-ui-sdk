// (C) 2021 GoodData Corporation

import { IExecutionResult } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface IExecutionResultEnvelope {
    id: string;
    isLoading: boolean;
    executionResult?: IExecutionResult;
    error?: GoodDataSdkError;
}
