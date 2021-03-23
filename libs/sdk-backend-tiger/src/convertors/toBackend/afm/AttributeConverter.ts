// (C) 2020-2021 GoodData Corporation

import { IAttribute } from "@gooddata/sdk-model";
import { VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";

import { toDisplayFormQualifier } from "../ObjRefConverter";

export function convertAttribute(attribute: IAttribute, idx: number): VisualizationObjectModelV2.IAttribute {
    const alias = attribute.attribute.alias;
    const aliasProp = alias ? { alias } : {};
    const displayFromRef = attribute.attribute.displayForm;

    return {
        displayForm: toDisplayFormQualifier(displayFromRef),
        localIdentifier: attribute.attribute.localIdentifier || `a${idx + 1}`,
        ...aliasProp,
    };
}
