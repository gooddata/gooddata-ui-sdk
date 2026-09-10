// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import {
    type ObjRef,
    areObjRefsEqual,
    catalogComputedAttributeAsCatalogAttribute,
} from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import {
    selectCatalogAttributes,
    selectCatalogComputedAttributes,
} from "../../model/store/catalog/catalogSelectors.js";

export function useAttribute() {
    const attributes = useDashboardSelector(selectCatalogAttributes);
    const computedAttributes = useDashboardSelector(selectCatalogComputedAttributes);

    return useCallback(
        (ref?: ObjRef) => {
            if (!ref) {
                return null;
            }
            const matches = (a: (typeof attributes)[number]) =>
                areObjRefsEqual(ref, a.attribute.ref) ||
                a.attribute.displayForms.some((df) => areObjRefsEqual(df.ref, ref));

            // Key driver refs come back untyped (the changeAnalysis response has no type
            // discriminator), so an id shared by a label and a computed attribute is ambiguous.
            // Plain attributes are matched first to make the resolution deterministic.
            return (
                attributes.find(matches) ??
                computedAttributes.map(catalogComputedAttributeAsCatalogAttribute).find(matches) ??
                null
            );
        },
        [attributes, computedAttributes],
    );
}
