// (C) 2026 GoodData Corporation

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import { deriveCopyIdentity } from "../asCode/copy.js";

export function createCopiedParameter(
    parameter: IParameterMetadataObjectDefinition,
): IParameterMetadataObjectDefinition {
    // A parameter definition carries no server-managed fields, so every field other than the
    // re-derived identity is copied as-is.
    const { id: _id, title: _title, ...parameterRest } = parameter;
    return {
        ...deriveCopyIdentity(parameter),
        ...parameterRest,
    };
}
