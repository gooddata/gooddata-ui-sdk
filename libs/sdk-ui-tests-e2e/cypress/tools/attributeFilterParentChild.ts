// (C) 2022-2025 GoodData Corporation

import { AttributeFilter } from "./attributeFilter";

export class AttributeFilterParentChild {
    private parentAttributeFilter;
    private childAttributeFilter;

    constructor(parentSelector: string, childSelector: string) {
        this.parentAttributeFilter = new AttributeFilter(parentSelector);
        this.childAttributeFilter = new AttributeFilter(childSelector);
    }

    getParentFilter() {
        return this.parentAttributeFilter;
    }

    getChildFilter() {
        return this.childAttributeFilter;
    }
}
