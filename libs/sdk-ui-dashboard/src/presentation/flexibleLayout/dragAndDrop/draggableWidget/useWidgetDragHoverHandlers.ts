// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { useDashboardDispatch } from "../../../../model/react/DashboardStoreProvider.js";
import { uiActions } from "../../../../model/store/ui/index.js";
import { type DropZoneType, type ILayoutItemPath } from "../../../../types.js";

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
