// (C) 2022 GoodData Corporation
import { useCallback } from "react";

import {
    useDashboardDispatch,
    uiActions,
    eagerRemoveSectionItem,
    useDashboardSelector,
    selectWidgetPlaceholder,
} from "../../../model";

/**
 * @internal
 */
export function useWidgetDragEndHandler() {
    const dispatch = useDashboardDispatch();
    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    return useCallback(
        (didDrop: boolean) => {
            if (!didDrop && widgetPlaceholder) {
                dispatch(eagerRemoveSectionItem(widgetPlaceholder.sectionIndex, widgetPlaceholder.itemIndex));
            }
            dispatch(uiActions.setIsDraggingWidget(false));
        },
        [dispatch, widgetPlaceholder],
    );
}
