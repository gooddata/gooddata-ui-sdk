// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectCatalogDateAttributes } from "../../model/store/catalog/catalogSelectors.js";

export function useDateAttribute() {
    const dateAttributes = useDashboardSelector(selectCatalogDateAttributes);

    return useCallback(
        (ref?: ObjRef) => {
            return ref
                ? (dateAttributes.find(
                      (a) =>
                          areObjRefsEqual(ref, a.attribute.ref) ||
                          a.attribute.displayForms.some((df) => areObjRefsEqual(df.ref, ref)),
                  ) ?? null)
                : null;
        },
        [dateAttributes],
    );
}
