// (C) 2021-2025 GoodData Corporation
import { useCallback, useMemo } from "react";

import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import {
    selectShowWidgetAsTable,
    setShowWidgetAsTable,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

/**
 * Hook for toggling and checking if a widget should be shown as table.
 *
 * @param widget - The widget to check and toggle.
 * @returns isWidgetAsTable, toggleWidgetAsTable
 *
 * @beta
 */
export function useShowAsTable(widget: { ref: ObjRef }): {
    isWidgetAsTable: boolean;
    toggleWidgetAsTable: () => void;
    setWidgetAsTable: (asTable: boolean) => void;
} {
    const dispatch = useDashboardDispatch();
    const widgetsAsTable: ReturnType<typeof selectShowWidgetAsTable> =
        useDashboardSelector(selectShowWidgetAsTable);
    const isWidgetAsTable = useMemo(
        () => widgetsAsTable.some((ref) => areObjRefsEqual(ref, widget.ref)),
        [widgetsAsTable, widget.ref],
    );

    const toggleWidgetAsTable = useCallback(() => {
        dispatch(setShowWidgetAsTable(widget.ref, !isWidgetAsTable));
    }, [dispatch, widget.ref, isWidgetAsTable]);

    const setWidgetAsTable = useCallback(
        (asTable: boolean) => {
            dispatch(setShowWidgetAsTable(widget.ref, asTable));
        },
        [dispatch, widget.ref],
    );

    return { isWidgetAsTable, toggleWidgetAsTable, setWidgetAsTable };
}
