// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { type ICatalogAttribute, areObjRefsEqual } from "@gooddata/sdk-model";

import { useAttribute } from "../../hooks/useAttribute.js";
import { useKdaState } from "../../providers/KdaState.js";

export function useUnusedAttributes() {
    const { state } = useKdaState();
    const attributeFinder = useAttribute();

    return useMemo(() => {
        const relevantAttributes = state.relevantAttributes
            .map(attributeFinder)
            .filter((attribute): attribute is ICatalogAttribute => !!attribute);

        const filters = state.attributeFilters;
        return relevantAttributes.filter((attr) => {
            return !filters.some(
                (f) =>
                    areObjRefsEqual(f.attributeFilter.displayForm, attr.attribute.ref) ||
                    attr.displayForms.some((df) => areObjRefsEqual(f.attributeFilter.displayForm, df.ref)),
            );
        });
    }, [attributeFinder, state.attributeFilters, state.relevantAttributes]);
}
