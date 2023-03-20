// (C) 2022-2023 GoodData Corporation
import React, { useState } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import {
    IAttributeElements,
    IAttributeFilter,
    idRef,
    attributeDisplayFormRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    isPositiveAttributeFilter,
    isNegativeAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
} from "@gooddata/sdk-model";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const parentAttrFilter = newNegativeAttributeFilter(attributeDisplayFormRef(Md.Product.Name), {
    uris: [],
});

const childAttrFilter = newPositiveAttributeFilter(attributeDisplayFormRef(Md.Department), {
    uris: [],
});

const parentFilterOverAttribute = idRef("attr.opportunitysnapshot.id");

export const SingleSelectionAttributeFilterParentChildScenario: React.FC = () => {
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
                selectionMode="single"
            />
            <div className="f-parent">
                <b>Parent</b>: <span className="count">{getCount(parentFilter)}</span>
            </div>
            <div className="f-child">
                <b>Child</b>: <span className="count">{getCount(childFilter)}</span>
            </div>
        </div>
    );
};

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
