// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { selectCatalogAttributes, useDashboardSelector } from "../../model/index.js";

export function useAttribute() {
    const dateAttributes = useDashboardSelector(selectCatalogAttributes);

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
