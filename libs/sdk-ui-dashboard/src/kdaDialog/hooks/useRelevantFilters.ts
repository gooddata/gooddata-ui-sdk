// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { type ICatalogAttribute } from "@gooddata/sdk-model";

import { useKdaState } from "../providers/KdaState.js";
import { getOnlyRelevantFilters } from "../utils.js";
import { useAttribute } from "./useAttribute.js";

export function useRelevantFilters() {
    const { state } = useKdaState();
    const attributeFinder = useAttribute();

    return useMemo(() => {
        const relevantAttributes = state.relevantAttributes
            .map(attributeFinder)
            .filter((attribute): attribute is ICatalogAttribute => !!attribute);
        return getOnlyRelevantFilters(state.attributeFilters, relevantAttributes);
    }, [attributeFinder, state.attributeFilters, state.relevantAttributes]);
}
