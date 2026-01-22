// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectAllCatalogDisplayFormsMap } from "../../model/store/catalog/catalogSelectors.js";
import { selectAttributeFilterDisplayFormsMap } from "../../model/store/tabs/filterContext/filterContextSelectors.js";

export function useAttributeFilterDisplayFormFromMap() {
    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const attributeFilterDisplayFormsMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    return useCallback(
        (displayForm: ObjRef) => {
            return attributeFilterDisplayFormsMap.get(displayForm) ?? catalogDisplayFormsMap.get(displayForm);
        },
        [attributeFilterDisplayFormsMap, catalogDisplayFormsMap],
    );
}
