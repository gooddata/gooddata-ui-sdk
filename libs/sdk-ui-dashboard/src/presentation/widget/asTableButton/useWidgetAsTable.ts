// (C) 2021-2025 GoodData Corporation
import { useCallback, useMemo } from "react";
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { useDashboardDispatch, useDashboardSelector } from "../../../model/index.js";
import { selectWidgetsToShowAsTable } from "../../../model/store/widgetsToShowAsTable/widgetsToShowAsTableSelectors.js";
import { setWidgetToShowAsTable } from "../../../model/commands/widgetsToShowAsTable.js";

/**
 * Hook for toggling and checking if a widget should be shown as table.
 *
 * @param widget - The widget to check and toggle.
 * @returns isWidgetAsTable, toggleWidgetAsTable
 *
 * @public
 */
export function useWidgetAsTable(widget: { ref: ObjRef }): {
    isWidgetAsTable: boolean;
    toggleWidgetAsTable: () => void;
} {
    const dispatch = useDashboardDispatch();
    const widgetsAsTable = useDashboardSelector(selectWidgetsToShowAsTable);
    const isWidgetAsTable = useMemo(
        () => widgetsAsTable.some((ref) => areObjRefsEqual(ref, widget.ref)),
        [widgetsAsTable, widget.ref],
    );

    const toggleWidgetAsTable = useCallback(() => {
        dispatch(setWidgetToShowAsTable(widget.ref, !isWidgetAsTable));
    }, [dispatch, widget.ref, isWidgetAsTable]);

    return { isWidgetAsTable, toggleWidgetAsTable };
}
