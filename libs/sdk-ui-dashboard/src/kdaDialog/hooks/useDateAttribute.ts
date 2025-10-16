// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { selectCatalogDateAttributes, useDashboardSelector } from "../../model/index.js";

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
