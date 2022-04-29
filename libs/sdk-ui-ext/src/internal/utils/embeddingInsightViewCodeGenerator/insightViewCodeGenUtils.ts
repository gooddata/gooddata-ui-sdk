// (C) 2022 GoodData Corporation

import { isIdentifierRef, isUriRef } from "@gooddata/sdk-model";
import { IAdditionalFactoryDefinition } from "../embeddingCodeGenerator/types";

interface IInsightViewAdditionTransformationOptions {
    uriRef: string;
    idRef: string;
}

export function insightViewAdditionalTransformations(
    options?: IInsightViewAdditionTransformationOptions,
): IAdditionalFactoryDefinition[] {
    const { uriRef = "@gooddata/sdk-model", idRef = "@gooddata/sdk-model" } = options ?? {};
    return [
        {
            importInfo: {
                importType: "named",
                name: "uriRef",
                package: uriRef,
            },
            transformation: (obj) => {
                return isUriRef(obj) ? `uriRef("${obj.uri}")` : undefined;
            },
        },
        {
            importInfo: {
                importType: "named",
                name: "idRef",
                package: idRef,
            },
            transformation: (obj) => {
                return isIdentifierRef(obj) ? `uriRef("${obj.identifier}")` : undefined;
            },
        },
    ];
}
