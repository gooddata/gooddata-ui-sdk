// (C) 2022 GoodData Corporation
import { useCallback } from "react";

import { uiActions, useDashboardDispatch } from "../../../model/index.js";

/**
 * @internal
 */
export function useWidgetDragEndHandler() {
    const dispatch = useDashboardDispatch();

    return useCallback(() => {
        dispatch(uiActions.clearDraggingWidgetSource());
        dispatch(uiActions.clearDraggingWidgetTarget());
    }, [dispatch]);
}
