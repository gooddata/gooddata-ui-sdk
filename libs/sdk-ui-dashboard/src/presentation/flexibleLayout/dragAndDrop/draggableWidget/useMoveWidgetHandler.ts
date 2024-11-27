// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";

import {
    useDashboardDispatch,
    moveNestedLayoutSectionItemAndRemoveOriginalSectionIfEmpty,
} from "../../../../model/index.js";

import { ILayoutItemPath } from "../../../../types.js";
import {
    areItemsInSameSection,
    getItemIndex,
    updateItemIndex,
} from "../../../../_staging/layout/coordinates.js";
import {
    VisualizationSwitcherDraggableItem,
    KpiDraggableItem,
    InsightDraggableItem,
    RichTextDraggableItem,
    DashboardLayoutDraggableItem,
} from "../../../dragAndDrop/index.js";

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
