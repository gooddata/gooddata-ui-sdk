// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import {
    moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    useDashboardDispatch,
} from "../../../../model/index.js";
import { BaseDraggableMovingItem } from "../../../dragAndDrop/index.js";

export function useMoveWidgetToNewSectionDropHandler(newSectionIndex: number) {
    const dispatch = useDashboardDispatch();

    return useCallback(
        (item: BaseDraggableMovingItem) =>
            dispatch(
                moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty(
                    item.sectionIndex,
                    item.itemIndex,
                    newSectionIndex,
                ),
            ),
        [dispatch, newSectionIndex],
    );
}
