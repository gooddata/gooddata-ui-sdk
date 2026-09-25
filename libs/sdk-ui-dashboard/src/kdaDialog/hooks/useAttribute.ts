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

            // A key driver ref carries its type (`displayForm` or `computedAttribute`), so a label and a
            // computed attribute with the same id resolve to different catalog items. A backend without
            // `attributeRef` sends the ref untyped; then only the id compares, and matching plain
            // attributes first keeps that resolution deterministic.
            return (
                attributes.find(matches) ??
                computedAttributes.map(catalogComputedAttributeAsCatalogAttribute).find(matches) ??
                null
            );
        },
        [attributes, computedAttributes],
    );
}
