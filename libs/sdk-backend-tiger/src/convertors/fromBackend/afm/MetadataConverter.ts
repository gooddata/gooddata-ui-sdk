// (C) 2025 GoodData Corporation

import { ExecutionResultDataSourceMessage, ExecutionResultMetadata } from "@gooddata/api-client-tiger";
import { IExecutionResultDataSourceMessage, IExecutionResultMetadata } from "@gooddata/sdk-backend-spi";

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
