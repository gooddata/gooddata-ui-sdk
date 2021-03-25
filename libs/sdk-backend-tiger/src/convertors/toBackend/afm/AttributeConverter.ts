// (C) 2020-2021 GoodData Corporation

import { IAttribute } from "@gooddata/sdk-model";
import { VisualizationObjectModelV2 } from "@gooddata/api-client-tiger";

import { toLabelQualifier } from "../ObjRefConverter";

export function convertAttribute(attribute: IAttribute, idx: number): VisualizationObjectModelV2.IAttribute {
    const alias = attribute.attribute.alias;
    const aliasProp = alias ? { alias } : {};
    const labelRef = attribute.attribute.displayForm;

    return {
        label: toLabelQualifier(labelRef),
        localIdentifier: attribute.attribute.localIdentifier || `a${idx + 1}`,
        ...aliasProp,
    };
}
