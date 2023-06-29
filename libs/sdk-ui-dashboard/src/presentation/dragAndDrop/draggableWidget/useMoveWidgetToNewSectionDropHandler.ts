// (C) 2022 GoodData Corporation
import { useCallback } from "react";

import {
    useDashboardDispatch,
    moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
} from "../../../model/index.js";
import { BaseDraggableMovingItem } from "../types.js";

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
