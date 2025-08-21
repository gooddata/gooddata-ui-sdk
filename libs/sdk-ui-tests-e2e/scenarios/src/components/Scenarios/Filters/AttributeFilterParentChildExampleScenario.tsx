// (C) 2022-2025 GoodData Corporation
import React, { useState } from "react";

import {
    IAttributeElements,
    IAttributeFilter,
    attributeDisplayFormRef,
    idRef,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const parentAttrFilter = newNegativeAttributeFilter(attributeDisplayFormRef(Md.Product.Name), {
    uris: [],
});

const childAttrFilter = newNegativeAttributeFilter(attributeDisplayFormRef(Md.Department), {
    uris: [],
});

const parentFilterOverAttribute = idRef("attr.opportunitysnapshot.id");

export function AttributeFilterParentChildExampleScenario() {
    const [parentFilter, setParentFilter] = useState<IAttributeFilter>(parentAttrFilter);
    const [childFilter, setChildFilter] = useState<IAttributeFilter>(childAttrFilter);

    return (
        <div>
            <AttributeFilter filter={parentFilter} onApply={setParentFilter} />
            <AttributeFilter
                filter={childFilter}
                parentFilters={parentFilter ? [parentFilter] : []}
                parentFilterOverAttribute={parentFilterOverAttribute}
                onApply={setChildFilter}
            />
            <div className="f-parent">
                <b>Parent</b>: <span className="count">{getCount(parentFilter)}</span>
            </div>
            <div className="f-child">
                <b>Child</b>: <span className="count">{getCount(childFilter)}</span>
            </div>
        </div>
    );
}

function getCount(filter: IAttributeFilter) {
    if (isPositiveAttributeFilter(filter)) {
        const filterIn = filter.positiveAttributeFilter.in as IAttributeElements;
        if (isAttributeElementsByRef(filterIn)) {
            return filterIn.uris.length;
        }
        if (isAttributeElementsByValue(filterIn)) {
            return filterIn.values.length;
        }
    }
    if (isNegativeAttributeFilter(filter)) {
        const filterIn = filter.negativeAttributeFilter.notIn as IAttributeElements;
        if (isAttributeElementsByRef(filterIn)) {
            return filterIn.uris.length;
        }
        if (isAttributeElementsByValue(filterIn)) {
            return filterIn.values.length;
        }
    }
    return 0;
}
