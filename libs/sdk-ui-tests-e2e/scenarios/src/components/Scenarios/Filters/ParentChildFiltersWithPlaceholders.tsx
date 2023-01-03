// (C) 2022 GoodData Corporation
import React, { useEffect } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import {
    attributeDisplayFormRef,
    IAttributeFilter,
    idRef,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";

import * as Md from "../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear";
import {
    newPlaceholder,
    PlaceholdersProvider,
    usePlaceholder,
    useResolveValueWithPlaceholders,
} from "@gooddata/sdk-ui";

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

const InnerParentChildFiltersWithPlaceholders: React.FC = () => {
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
};

export const ParentChildFiltersWithPlaceholders: React.FC = () => {
    return (
        <PlaceholdersProvider>
            <InnerParentChildFiltersWithPlaceholders />
        </PlaceholdersProvider>
    );
};
