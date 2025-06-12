// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";

import {
    useDashboardDispatch,
    moveSectionItemAndRemoveOriginalSectionIfEmpty,
} from "../../../../model/index.js";

import {
    VisualizationSwitcherDraggableItem,
    KpiDraggableItem,
    InsightDraggableItem,
    RichTextDraggableItem,
} from "../../../dragAndDrop/index.js";

export function useMoveWidgetDropHandler(sectionIndex: number, itemIndex: number) {
    const dispatch = useDashboardDispatch();

    return useCallback(
        (
            item:
                | KpiDraggableItem
                | InsightDraggableItem
                | RichTextDraggableItem
                | VisualizationSwitcherDraggableItem,
        ) => {
            let targetIndex = itemIndex;

            if (item.sectionIndex === sectionIndex) {
                // if the item is moved within the same section to bigger index, indexes are shifted by 1
                if (item.itemIndex < itemIndex) {
                    targetIndex = itemIndex - 1;
                }

                if (item.itemIndex === targetIndex) {
                    // same positions we do not need to do anything
                    return;
                }
            }

            dispatch(
                moveSectionItemAndRemoveOriginalSectionIfEmpty(
                    item.sectionIndex,
                    item.itemIndex,
                    sectionIndex,
                    targetIndex,
                ),
            );
        },
        [dispatch, itemIndex, sectionIndex],
    );
}
