// (C) 2025 GoodData Corporation

import {
    type ExecutionResultDataSourceMessage,
    type ExecutionResultMetadata,
} from "@gooddata/api-client-tiger";
import {
    type IExecutionResultDataSourceMessage,
    type IExecutionResultMetadata,
} from "@gooddata/sdk-backend-spi";

export function convertExecutionResultMetadata(metadata: ExecutionResultMetadata): IExecutionResultMetadata {
    // added for forward compatibility, currently there is no conversion necessary (save for types)
    return {
        dataSourceMessages: convertDataSourceMessages(metadata.dataSourceMessages),
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
