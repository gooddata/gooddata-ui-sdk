// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import { uiActions, useDashboardDispatch } from "../../../../model/index.js";
import { ILayoutItemPath, DropZoneType } from "../../../../types.js";

/**
 * @internal
 */
export function useWidgetDragHoverHandlers() {
    const dispatch = useDashboardDispatch();

    const handleDragHoverStart = useCallback(
        (coordinates: ILayoutItemPath, triggeringDropZoneType: DropZoneType) => {
            dispatch(uiActions.setDraggingWidgetTarget({ path: coordinates, triggeringDropZoneType }));
        },
        [dispatch],
    );

    const handleDragHoverEnd = useCallback(() => {
        dispatch(uiActions.clearDraggingWidgetTarget());
    }, [dispatch]);

    return { handleDragHoverStart, handleDragHoverEnd };
}
