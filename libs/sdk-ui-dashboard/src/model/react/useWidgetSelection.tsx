// (C) 2022 GoodData Corporation
import { MouseEvent, useCallback } from "react";
import { areObjRefsEqual, ObjRef } from "@gooddata/sdk-model";
import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";
import {
    selectConfigurationPanelOpened,
    selectIsInEditMode,
    selectSelectedWidgetRef,
    uiActions,
} from "../store/index.js";

/**
 * @internal
 */
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
     * Callback to call when an item is selected. Called with the relevant mouse event if originating from a click.
     */
    onSelected: (e?: MouseEvent) => void;
    /**
     * Callback to call when you want to close the config panel.
     */
    closeConfigPanel: () => void;
    /**
     * Callback to call to deselect widgets. Called with the relevant mouse event if originating from a click.
     */
    deselectWidgets: (e?: MouseEvent) => void;
    /**
     * Flag indicating the given item has its config panel open.
     */
    hasConfigPanelOpen: boolean;
}

interface IHasWidgetSelectMark extends MouseEvent {
    processedDuringWidgetSelect: boolean;
}

/**
 * @internal
 */
export function useWidgetSelection(widgetRef?: ObjRef): IUseWidgetSelectionResult {
    const dispatch = useDashboardDispatch();

    const isConfigPanelOpen = useDashboardSelector(selectConfigurationPanelOpened);

    const isSelectable = useDashboardSelector(selectIsInEditMode);

    const selectedWidget = useDashboardSelector(selectSelectedWidgetRef);
    const isSelected = Boolean(
        isSelectable && selectedWidget && widgetRef && areObjRefsEqual(selectedWidget, widgetRef),
    );

    const closeConfigPanel = useCallback(() => {
        dispatch(uiActions.setConfigurationPanelOpened(false));
    }, [dispatch]);

    const onSelected = useCallback(
        (e?: MouseEvent) => {
            if (e) {
                /**
                 * Do not stop propagation, just mark event as processed here so that in case come other element
                 * up the tree uses the deselectWidgets function. Without this mark such element would immediately
                 * deselect the widget we just selected with the same click.
                 */
                (e as IHasWidgetSelectMark).processedDuringWidgetSelect = true;
            }

            if (isSelectable && widgetRef) {
                dispatch(uiActions.selectWidget(widgetRef));
                dispatch(uiActions.setConfigurationPanelOpened(true));
            }
        },
        [isSelectable, widgetRef, dispatch],
    );

    const deselectWidgets = useCallback(
        (e?: MouseEvent) => {
            if (!(e as IHasWidgetSelectMark)?.processedDuringWidgetSelect && selectedWidget) {
                dispatch(uiActions.clearWidgetSelection());
            }
        },
        [dispatch, selectedWidget],
    );

    return {
        isSelectable,
        isSelected,
        onSelected,
        hasConfigPanelOpen: isConfigPanelOpen && isSelected,
        closeConfigPanel,
        deselectWidgets,
    };
}
