// (C) 2022 GoodData Corporation
import { useCallback } from "react";

import {
    useDashboardDispatch,
    uiActions,
    eagerRemoveSectionItem,
    useDashboardSelector,
    selectWidgetPlaceholderCoordinates,
} from "../../../model";

/**
 * @internal
 */
export function useWidgetDragEndHandler() {
    const dispatch = useDashboardDispatch();
    const widgetPlaceholderCoords = useDashboardSelector(selectWidgetPlaceholderCoordinates);

    return useCallback(
        (didDrop: boolean) => {
            if (!didDrop && widgetPlaceholderCoords) {
                dispatch(
                    eagerRemoveSectionItem(
                        widgetPlaceholderCoords.sectionIndex,
                        widgetPlaceholderCoords.itemIndex,
                    ),
                );
            }
            dispatch(uiActions.setIsDraggingWidget(false));
        },
        [dispatch, widgetPlaceholderCoords],
    );
}
