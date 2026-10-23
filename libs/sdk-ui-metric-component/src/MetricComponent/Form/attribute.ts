// (C) 2022-2026 GoodData Corporation

import { type IAttribute, type ICatalogAttribute, newAttribute } from "@gooddata/sdk-model";

export function createAttribute(attr: ICatalogAttribute): IAttribute {
    return newAttribute(attr.attribute.ref, (m) => {
        m.displayForm(attr.defaultDisplayForm.ref);
        m.defaultLocalId();
        return m;
    });
}
