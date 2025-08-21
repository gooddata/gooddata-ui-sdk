// (C) 2022-2025 GoodData Corporation
import React, { useEffect } from "react";

import {
    IAttributeFilter,
    attributeDisplayFormRef,
    idRef,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import {
    PlaceholdersProvider,
    newPlaceholder,
    usePlaceholder,
    useResolveValueWithPlaceholders,
} from "@gooddata/sdk-ui";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";

const parentAttrFilterPlaceholder = newPlaceholder<IAttributeFilter>(
    newNegativeAttributeFilter(attributeDisplayFormRef(Md.Product.Name), {
        uris: [],
    }),
);

const childAttrFilterPlaceholder = newPlaceholder<IAttributeFilter>(
    newNegativeAttributeFilter(attributeDisplayFormRef(Md.Department), {
        uris: [],
    }),
);

const parentFilterOverAttribute = idRef("attr.opportunitysnapshot.id");

function InnerParentChildFiltersWithPlaceholders() {
    const [, setChildFilter] = usePlaceholder(childAttrFilterPlaceholder);

    const parentFilter = useResolveValueWithPlaceholders(parentAttrFilterPlaceholder);

    useEffect(() => {
        setChildFilter(
            newNegativeAttributeFilter(attributeDisplayFormRef(Md.Department), {
                uris: [],
            }),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentFilter]);

    return (
        <div>
            <AttributeFilterButton connectToPlaceholder={parentAttrFilterPlaceholder} />
            <AttributeFilterButton
                parentFilters={[parentAttrFilterPlaceholder]}
                parentFilterOverAttribute={parentFilterOverAttribute}
                connectToPlaceholder={childAttrFilterPlaceholder}
            />
        </div>
    );
}

export function ParentChildFiltersWithPlaceholders() {
    return (
        <PlaceholdersProvider>
            <InnerParentChildFiltersWithPlaceholders />
        </PlaceholdersProvider>
    );
}
