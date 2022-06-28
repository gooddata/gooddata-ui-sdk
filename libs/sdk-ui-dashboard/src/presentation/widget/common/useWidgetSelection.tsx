// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import {
    selectIsInEditMode,
    selectSelectedWidgetRef,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";

export interface IUseWidgetSelectionResult {
    /**
     * Flag indicating the given item can be selected.
     */
    isSelectable: boolean;
    /**
     * Flag indicating the given item is selected.
     */
    isSelected: boolean;
    /**
     * Callback to call when an item is selected.
     */
    onSelected: () => void;
}

export function useWidgetSelection(widgetRef: ObjRef): IUseWidgetSelectionResult {
    const dispatch = useDashboardDispatch();

    const isSelectable = useDashboardSelector(selectIsInEditMode);

    const selectedWidget = useDashboardSelector(selectSelectedWidgetRef);
    const isSelected = isSelectable && !!selectedWidget && areObjRefsEqual(selectedWidget, widgetRef);

    const onSelected = useCallback(() => {
        if (isSelectable && widgetRef) {
            dispatch(uiActions.selectWidget(widgetRef));
        }
    }, [isSelectable, widgetRef, dispatch]);

    return {
        isSelectable,
        isSelected,
        onSelected,
    };
}
