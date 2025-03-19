// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";
import { ILayoutSectionPath } from "../../../../types.js";

import { BaseDraggableMovingItem } from "../../../dragAndDrop/index.js";
import {
    useDashboardDispatch,
    moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty,
} from "../../../../model/index.js";

export function useMoveWidgetToNewSectionDropHandler(newSectionIndex: ILayoutSectionPath) {
    const dispatch = useDashboardDispatch();

    return useCallback(
        (item: BaseDraggableMovingItem) =>
            dispatch(
                moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty(
                    item.layoutPath!,
                    newSectionIndex,
                ),
            ),
        [dispatch, newSectionIndex],
    );
}
