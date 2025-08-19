// (C) 2022-2025 GoodData Corporation
import React, { useState } from "react";

import {
    IAttributeFilter,
    attributeDisplayFormRef,
    idRef,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const parentAttrFilter = newNegativeAttributeFilter(attributeDisplayFormRef(Md.Product.Name), {
    uris: [],
});

const childAttrFilter = newNegativeAttributeFilter(attributeDisplayFormRef(Md.Department), {
    uris: [],
});

const parentFilterOverAttribute = idRef("attr.opportunitysnapshot.id");

export const AttributeFilterButtonParentChildScenario: React.FC = () => {
    const [parentFilter, setParentFilter] = useState<IAttributeFilter>(parentAttrFilter);
    const [childFilter, setChildFilter] = useState<IAttributeFilter>(childAttrFilter);

    const onParentFilterChanged = (filter: IAttributeFilter) => {
        setChildFilter(childAttrFilter);
        setParentFilter(filter);
    };

    return (
        <div>
            <AttributeFilterButton filter={parentFilter} onApply={onParentFilterChanged} />
            <AttributeFilterButton
                filter={childFilter}
                onApply={setChildFilter}
                parentFilters={parentFilter ? [parentFilter] : []}
                parentFilterOverAttribute={parentFilterOverAttribute}
            />
        </div>
    );
};
