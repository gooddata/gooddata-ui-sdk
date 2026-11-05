// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useDispatch, useSelector, useStore } from "react-redux";

import {
    type AnalyticalDesignerHeaderLayoutMode,
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerHeaderLayout,
} from "../../embedding/editorHeaderSlotTypes.js";
import { getProjectId } from "../../selectors/bootstrap_selector.js";
import { enableGenAiRightPanel } from "../../selectors/feature_flag_selector.js";
import { insightAccessTarget } from "../../selectors/insight_access_selector.js";
import { reportTitleSelector } from "../../selectors/report_title_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";
import { useCatalogSidebar } from "../catalogSidebar/useCatalogSidebarState.js";

/**
 * Layout of the editor header: the collapsible catalog takes precedence, then the right panel flag removes the
 * catalog-width offset of the legacy header.
 */
export function useEditorHeaderLayout(): IAnalyticalDesignerHeaderLayout {
    const { canCollapse, isCollapsed } = useCatalogSidebar();
    const isGenAiRightPanelEnabled = useSelector(enableGenAiRightPanel);

    let mode: AnalyticalDesignerHeaderLayoutMode = "legacy";
    if (canCollapse) {
        mode = "catalogSidebar";
    } else if (isGenAiRightPanelEnabled) {
        mode = "compact";
    }

    return useMemo(
        () => ({ mode, isCatalogCollapsed: isCollapsed, canCollapseCatalog: canCollapse }),
        [mode, isCollapsed, canCollapse],
    );
}

/**
 * The data every editor header slot receives.
 */
export function useEditorHeaderContext(): IAnalyticalDesignerHeaderContext {
    const layout = useEditorHeaderLayout();
    const workspace = useSelector(getProjectId);
    const target = useSelector(insightAccessTarget);
    const { currentTitle, hasUnsavedChanges } = useSelector(reportTitleSelector);
    const insightRef = target?.ref;

    return useMemo(
        () => ({
            layout,
            workspace,
            ...(insightRef ? { insightRef } : {}),
            title: currentTitle,
            hasUnsavedChanges,
        }),
        [layout, workspace, insightRef, currentTitle, hasUnsavedChanges],
    );
}

/**
 * A callback for a slot that checks the current state when called, so that a control shown as enabled, or a
 * host calling it at any time, cannot run an operation AD would refuse.
 *
 * @param isAllowed - whether the operation may run in the current state; keep it stable
 * @param run - the operation; keep it stable
 */
export function useGuardedCallback<TArgs extends unknown[]>(
    isAllowed: (state: IAppState) => boolean,
    run: (dispatch: AppDispatch, state: IAppState, ...args: TArgs) => void,
): (...args: TArgs) => void {
    const store = useStore<IAppState>();
    const dispatch = useDispatch<AppDispatch>();

    return useCallback(
        (...args: TArgs) => {
            const state = store.getState();
            if (isAllowed(state)) {
                run(dispatch, state, ...args);
            }
        },
        [store, dispatch, isAllowed, run],
    );
}
