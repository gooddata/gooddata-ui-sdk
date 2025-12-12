// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import {
    selectAllCatalogDisplayFormsMap,
    selectAttributeFilterDisplayFormsMap,
    useDashboardSelector,
} from "../../model/index.js";

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
