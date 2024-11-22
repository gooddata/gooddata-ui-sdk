// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";

import { BaseDraggableMovingItem } from "../../../dragAndDrop/index.js";
import {
    useDashboardDispatch,
    moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
} from "../../../../model/index.js";

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
