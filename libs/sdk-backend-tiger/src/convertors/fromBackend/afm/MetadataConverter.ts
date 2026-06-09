// (C) 2025-2026 GoodData Corporation

import {
    type ExecutionResultDataSourceMessage,
    type ExecutionResultLimitBreak,
    type ExecutionResultMetadata,
} from "@gooddata/api-client-tiger";
import {
    type IExecutionResultDataSourceMessage,
    type IExecutionResultMetadata,
} from "@gooddata/sdk-backend-spi";
import { type IExecutionResultLimitBreak } from "@gooddata/sdk-model";

export function convertExecutionResultMetadata(metadata: ExecutionResultMetadata): IExecutionResultMetadata {
    // added for forward compatibility, currently there is no conversion necessary (save for types)
    return {
        dataSourceMessages: convertDataSourceMessages(metadata.dataSourceMessages),
        limitBreaks: metadata.limitBreaks ? convertLimitBreaks(metadata.limitBreaks) : undefined,
    };
}

function convertDataSourceMessages(
    messages: ReadonlyArray<ExecutionResultDataSourceMessage>,
): ReadonlyArray<IExecutionResultDataSourceMessage> {
    // added for forward compatibility, currently there is no conversion necessary (save for types)
    return messages.map((m) => ({
        ...m,
    }));
}

function convertLimitBreaks(
    limitBreaks: ReadonlyArray<ExecutionResultLimitBreak>,
): ReadonlyArray<IExecutionResultLimitBreak> {
    // added for forward compatibility, currently there is no conversion necessary (save for types)
    return limitBreaks.map((limitBreak) => ({
        ...limitBreak,
    }));
}
