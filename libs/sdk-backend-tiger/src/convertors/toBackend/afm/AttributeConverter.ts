// (C) 2020-2023 GoodData Corporation

import { IAttribute } from "@gooddata/sdk-model";
import { AttributeItem } from "@gooddata/api-client-tiger";

import { toLabelQualifier } from "../ObjRefConverter.js";

export function convertAttribute(attribute: IAttribute, idx: number): AttributeItem {
    const { displayForm, alias, showAllValues } = attribute.attribute;
    const aliasProp = alias ? { alias } : {};
    const showAllValuesProp = showAllValues ? { showAllValues } : {};

    return {
        label: toLabelQualifier(displayForm),
        localIdentifier: attribute.attribute.localIdentifier || `a${idx + 1}`,
        ...aliasProp,
        ...showAllValuesProp,
    };
}
