// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { useDashboardDispatch } from "../../../model/react/DashboardStoreProvider.js";
import { uiActions } from "../../../model/store/ui/index.js";

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
