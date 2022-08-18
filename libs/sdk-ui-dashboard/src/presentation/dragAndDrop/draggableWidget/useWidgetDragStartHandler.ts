// (C) 2022 GoodData Corporation
import { useCallback } from "react";

import { useDashboardDispatch, useWidgetSelection, uiActions } from "../../../model";
import { DraggableItem } from "../types";
import { useAddInitialSectionHandler } from "./useAddInitialSectionHandler";

/**
 * @internal
 */
export function useWidgetDragStartHandler() {
    const dispatch = useDashboardDispatch();
    const { deselectWidgets } = useWidgetSelection();
    const addInitialSectionHandler = useAddInitialSectionHandler();

    return useCallback(
        (item: DraggableItem) => {
            deselectWidgets();
            addInitialSectionHandler(item);
            dispatch(uiActions.setIsDraggingWidget(true));
        },
        [addInitialSectionHandler, deselectWidgets, dispatch],
    );
}
