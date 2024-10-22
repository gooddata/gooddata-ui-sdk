// (C) 2019-2024 GoodData Corporation

import { AttributeItem } from "@gooddata/api-client-tiger";
import { IAttribute, idRef } from "@gooddata/sdk-model";

export function convertAttribute(item: AttributeItem): IAttribute {
    return {
        attribute: {
            localIdentifier: item.localIdentifier,
            displayForm: idRef(item.label.identifier.id, "displayForm"),
            showAllValues: item.showAllValues,
        },
    };
}
