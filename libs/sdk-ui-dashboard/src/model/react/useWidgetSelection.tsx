// (C) 2022-2025 GoodData Corporation
import { type MouseEvent, useCallback } from "react";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

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
            let processedDuringWidgetSelectOriginal = false;
            if (e) {
                /**
                 * Do not stop propagation, just mark event as processed here so that in case come other element
                 * up the tree uses the deselectWidgets function. Without this mark such element would immediately
                 * deselect the widget we just selected with the same click.
                 */
                processedDuringWidgetSelectOriginal = (e as IHasWidgetSelectMark).processedDuringWidgetSelect;
                (e as IHasWidgetSelectMark).processedDuringWidgetSelect = true;
            }

            if (isSelectable && widgetRef && !processedDuringWidgetSelectOriginal) {
                dispatch(uiActions.selectWidget(widgetRef));
                dispatch(uiActions.setConfigurationPanelOpened(true));
            }
        },
        [isSelectable, widgetRef, dispatch],
    );

    const deselectWidgets = useCallback(
        (e?: MouseEvent) => {
            // Avoid deselect widget when the click event was triggered by selecting text
            // (eg. selecting markdown text in rich text widget and releasing mouse outside of the widget)
            const isSelection = window.getSelection()?.type === "Range";

            if (!(e as IHasWidgetSelectMark)?.processedDuringWidgetSelect && selectedWidget && !isSelection) {
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
