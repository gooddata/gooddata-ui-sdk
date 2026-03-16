// (C) 2022-2026 GoodData Corporation

import { useEffect } from "react";

import {
    type IAttributeFilter,
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
import * as Md from "@gooddata/sdk-ui-tests-reference-workspace/current_bear";

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
