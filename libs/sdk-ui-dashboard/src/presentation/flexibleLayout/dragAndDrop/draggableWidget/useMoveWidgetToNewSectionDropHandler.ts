// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import {
    moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
    useDashboardDispatch,
} from "../../../../model/index.js";
import { type ILayoutSectionPath } from "../../../../types.js";
import { type BaseDraggableMovingItem } from "../../../dragAndDrop/index.js";

export function useMoveWidgetToNewSectionDropHandler(newSectionIndex: ILayoutSectionPath) {
    const dispatch = useDashboardDispatch();

    return useCallback(
        (item: BaseDraggableMovingItem) => {
            dispatch(
                moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty(
                    item.layoutPath!,
                    newSectionIndex,
                ),
            );
        },
        [dispatch, newSectionIndex],
    );
}
