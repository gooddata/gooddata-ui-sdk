// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import { uiActions, useDashboardDispatch } from "../../../../model/index.js";
import { ILayoutCoordinates } from "../../../../types.js";

/**
 * @internal
 */
export function useWidgetDragHoverHandlers() {
    const dispatch = useDashboardDispatch();

    const handleDragHoverStart = useCallback(
        (coordinates: ILayoutCoordinates) => {
            // always send "prev" type, this value is not used by legacy fluid layout
            dispatch(
                uiActions.setDraggingWidgetTarget({ path: [coordinates], triggeringDropZoneType: "prev" }),
            );
        },
        [dispatch],
    );

    const handleDragHoverEnd = useCallback(() => {
        dispatch(uiActions.clearDraggingWidgetTarget());
    }, [dispatch]);

    return { handleDragHoverStart, handleDragHoverEnd };
}
