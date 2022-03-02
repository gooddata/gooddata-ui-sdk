// (C) 2022 GoodData Corporation

import { AttributeFilterButton } from "./attributeFilterButton";

export class AttributeFilterButtonParentChild {
    private parentAttributeFilter;
    private childAttributeFilter;

    constructor(parentSelector: string, childSelector: string) {
        this.parentAttributeFilter = new AttributeFilterButton(parentSelector);
        this.childAttributeFilter = new AttributeFilterButton(childSelector);
    }

    getParentFilter() {
        return this.parentAttributeFilter;
    }

    getChildFilter() {
        return this.childAttributeFilter;
    }
}
