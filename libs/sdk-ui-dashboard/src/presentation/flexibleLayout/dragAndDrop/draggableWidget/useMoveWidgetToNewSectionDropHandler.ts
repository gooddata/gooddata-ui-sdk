// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty } from "../../../../model/commands/layout.js";
import { useDashboardDispatch } from "../../../../model/react/DashboardStoreProvider.js";
import { type ILayoutSectionPath } from "../../../../types.js";
import { type BaseDraggableMovingItem } from "../../../dragAndDrop/types.js";

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
