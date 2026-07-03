// (C) 2026 GoodData Corporation

import { useKdaState } from "../../providers/KdaState.js";

export function useCloseOnEscape() {
    const { state } = useKdaState();

    const definitionLoading = state.definitionStatus === "loading" || state.definitionStatus === "pending";
    const itemsLoading = state.itemsStatus === "loading" || state.itemsStatus === "pending";
    const noPopup =
        !state.attributesDropdownOpen &&
        !state.addFilterDropdownOpen &&
        !state.trendDropdownOpen &&
        !state.dateDropdownOpen;

    return noPopup || definitionLoading || itemsLoading;
}
