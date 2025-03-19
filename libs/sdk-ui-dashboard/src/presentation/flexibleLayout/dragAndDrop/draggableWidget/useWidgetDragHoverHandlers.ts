// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";

import { uiActions, useDashboardDispatch } from "../../../../model/index.js";
import { ILayoutItemPath } from "../../../../types.js";

/**
 * @internal
 */
export function useWidgetDragHoverHandlers() {
    const dispatch = useDashboardDispatch();

    const handleDragHoverStart = useCallback(
        (coordinations: ILayoutItemPath) => {
            dispatch(uiActions.setDraggingWidgetTarget(coordinations));
        },
        [dispatch],
    );

    const handleDragHoverEnd = useCallback(() => {
        dispatch(uiActions.clearDraggingWidgetTarget());
    }, [dispatch]);

    return { handleDragHoverStart, handleDragHoverEnd };
}
