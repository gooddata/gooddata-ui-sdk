// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { useSummaryDrivers } from "../../hooks/useSummaryDrivers.js";
import { useKdaState } from "../../providers/KdaState.js";

export function useGroupAndItem() {
    const { state } = useKdaState();
    const list = useSummaryDrivers();

    const selectedItem = state.selectedItem;
    const definition = state.definition;

    return useMemo(() => {
        if (selectedItem === "summary" || !definition) {
            return {
                group: null,
                item: null,
            };
        }

        const group = list.find((group) => areObjRefsEqual(group.attribute, selectedItem.data.attribute));
        if (!group) {
            return {
                group: null,
                item: null,
            };
        }

        return {
            group,
            item: selectedItem.data,
        };
    }, [definition, list, selectedItem]);
}
