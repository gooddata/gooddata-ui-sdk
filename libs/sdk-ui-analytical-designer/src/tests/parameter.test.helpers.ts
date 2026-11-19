// (C) 2026 GoodData Corporation

import {
    type IScalarParameterDefinition,
    type IScalarParameterMetadataObject,
    type IdentifierRef,
    idRef,
} from "@gooddata/sdk-model";

export function buildParameter(
    id: string,
    title: string,
    definition: IScalarParameterDefinition,
): IScalarParameterMetadataObject & { ref: IdentifierRef } {
    return {
        ref: idRef(id, "parameter"),
        id,
        uri: "",
        type: "parameter",
        title,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition,
    };
}
