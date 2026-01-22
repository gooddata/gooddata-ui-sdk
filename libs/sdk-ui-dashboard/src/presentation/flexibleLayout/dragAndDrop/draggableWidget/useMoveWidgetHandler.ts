// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import {
    areItemsInSameSection,
    getItemIndex,
    updateItemIndex,
} from "../../../../_staging/layout/coordinates.js";
import { moveNestedLayoutSectionItemAndRemoveOriginalSectionIfEmpty } from "../../../../model/commands/layout.js";
import { useDashboardDispatch } from "../../../../model/react/DashboardStoreProvider.js";
import { type ILayoutItemPath } from "../../../../types.js";
import {
    type DashboardLayoutDraggableItem,
    type InsightDraggableItem,
    type KpiDraggableItem,
    type RichTextDraggableItem,
    type VisualizationSwitcherDraggableItem,
} from "../../../dragAndDrop/types.js";

export function useMoveWidgetDropHandler(layoutPath: ILayoutItemPath) {
    const dispatch = useDashboardDispatch();

    return useCallback(
        (
            item:
                | KpiDraggableItem
                | InsightDraggableItem
                | RichTextDraggableItem
                | VisualizationSwitcherDraggableItem
                | DashboardLayoutDraggableItem,
        ) => {
            let targetIndex = getItemIndex(layoutPath);

            if (areItemsInSameSection(item.layoutPath, layoutPath)) {
                const currentItemIndex = getItemIndex(item.layoutPath!);

                // if the item is moved within the same section to bigger index, indexes are shifted by 1
                if (currentItemIndex < targetIndex) {
                    targetIndex = targetIndex - 1;
                }

                if (currentItemIndex === targetIndex) {
                    // same positions we do not need to do anything
                    return;
                }
            }

            dispatch(
                moveNestedLayoutSectionItemAndRemoveOriginalSectionIfEmpty(
                    item.layoutPath!,
                    updateItemIndex(layoutPath, targetIndex),
                ),
            );
        },
        [dispatch, layoutPath],
    );
}
