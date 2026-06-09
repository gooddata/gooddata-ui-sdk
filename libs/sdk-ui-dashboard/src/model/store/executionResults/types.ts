// (C) 2021-2026 GoodData Corporation

import { type IExecutionResult } from "@gooddata/sdk-backend-spi";
import { type IExecutionResultLimitBreak, type IResultWarning } from "@gooddata/sdk-model";
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
    /**
     * Limits broken during result computation, causing partial data to be returned for this widget.
     *
     * @alpha
     */
    limitBreaks?: IExecutionResultLimitBreak[];
}
