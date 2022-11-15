// (C) 2022 GoodData Corporation
import { useCallback } from "react";

import { uiActions, useDashboardDispatch } from "../../../model";
import { ILayoutCoordinates } from "../../../types";

/**
 * @internal
 */
export function useWidgetDragHoverHandlers() {
    const dispatch = useDashboardDispatch();

    const handleDragHoverStart = useCallback(
        (coordinations: ILayoutCoordinates) => {
            dispatch(uiActions.setDraggingWidgetTarget(coordinations));
        },
        [dispatch],
    );

    const handleDragHoverEnd = useCallback(() => {
        dispatch(uiActions.clearDraggingWidgetTarget());
    }, [dispatch]);

    return { handleDragHoverStart, handleDragHoverEnd };
}
