// (C) 2026 GoodData Corporation

import {
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
} from "@gooddata/sdk-model";

import {
    removeAttributeFilter,
    removeDateFilter,
    removeMeasureValueFilter,
} from "../../model/commands/filters.js";
import { removeParameters } from "../../model/commands/parameters.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../model/store/tabs/tabsSelectors.js";

import {
    isAttributeFilterDraggableItem,
    isDateFilterDraggableItem,
    isMeasureValueFilterDraggableItem,
    isParameterDraggableItem,
} from "./types.js";
import { useDashboardDrop } from "./useDashboardDrop.js";

/**
 * Drop target used for deleting supported dashboard items via drag-and-drop.
 *
 * @internal
 */
export function useFilterDeleteDrop() {
    const dispatch = useDashboardDispatch();
    const tabLocalIdentifier = useDashboardSelector(selectActiveOrDefaultTabLocalIdentifier);
    return useDashboardDrop(
        ["attributeFilter", "dateFilter", "parameter", "measureValueFilter"],
        {
            drop: (item) => {
                if (isAttributeFilterDraggableItem(item)) {
                    const identifier = dashboardAttributeFilterItemLocalIdentifier(item.filter)!;
                    dispatch(removeAttributeFilter(identifier));
                } else if (isDateFilterDraggableItem(item)) {
                    const dataSet = dashboardFilterObjRef(item.filter)!;
                    dispatch(removeDateFilter(dataSet));
                } else if (isMeasureValueFilterDraggableItem(item)) {
                    const identifier = dashboardFilterLocalIdentifier(item.filter)!;
                    dispatch(removeMeasureValueFilter(identifier));
                } else if (isParameterDraggableItem(item)) {
                    dispatch(removeParameters([item.ref], tabLocalIdentifier));
                }
            },
        },
        [dispatch, tabLocalIdentifier],
    );
}
