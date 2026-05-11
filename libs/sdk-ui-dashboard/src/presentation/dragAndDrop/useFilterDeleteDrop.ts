// (C) 2026 GoodData Corporation

import {
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
} from "@gooddata/sdk-model";

import {
    removeAttributeFilter,
    removeDateFilter,
    removeMeasureValueFilter,
} from "../../model/commands/filters.js";
import { useDashboardDispatch } from "../../model/react/DashboardStoreProvider.js";
import { parametersActions } from "../../model/store/parameters/index.js";

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
    return useDashboardDrop(
        ["attributeFilter", "dateFilter", "parameter", "measureValueFilter"],
        {
            drop: (item) => {
                if (isAttributeFilterDraggableItem(item)) {
                    const identifier = dashboardAttributeFilterItemLocalIdentifier(item.filter)!;
                    dispatch(removeAttributeFilter(identifier));
                } else if (isDateFilterDraggableItem(item)) {
                    const dataSet = item.filter.dateFilter.dataSet!;
                    dispatch(removeDateFilter(dataSet));
                } else if (isMeasureValueFilterDraggableItem(item)) {
                    const identifier = dashboardFilterLocalIdentifier(item.filter)!;
                    dispatch(removeMeasureValueFilter(identifier));
                } else if (isParameterDraggableItem(item)) {
                    dispatch(parametersActions.removeParameter({ ref: item.ref }));
                }
            },
        },
        [dispatch],
    );
}
