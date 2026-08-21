// (C) 2026 GoodData Corporation

import { type RefObject, useEffect, useRef } from "react";

import { useDispatch } from "react-redux";

import { type IWidget, type ObjRef, idRef } from "@gooddata/sdk-model";
import {
    type DashboardSelector,
    type DashboardSelectorEvaluator,
    type ExtendedDashboardWidget,
    newDisplayFormMap,
    newMapForObjectWithIdentity,
    selectActiveTab,
    selectAttributeFilterDisplayFormsMap,
    selectDashboardId,
    selectDashboardTitle,
    selectDashboardWorkingDefinition,
    selectFilterContextFilters,
    selectIsNewDashboard,
    selectVisualizationSwitcherActiveVisualizations,
    selectWidgetsMap,
} from "@gooddata/sdk-ui-dashboard";

import { setAmbientUserContextAction } from "../../store/chatWindow/chatWindowSlice.js";
import { mergeContexts } from "../build.js";
import { buildDashboardContext, buildFiltersContext, buildWidgetsContext } from "../dashboard.js";

export function useDashboardAmbientContext(dashboardSelector?: DashboardSelectorEvaluator) {
    const dispatch = useDispatch();
    const used = useRef(false);

    useEffect(() => {
        const context = dashboardSelector ? buildFromDashboard(dashboardSelector) : undefined;
        setContext(dispatch, context, used);
    }, [dashboardSelector, dispatch]);
}

function setContext(
    dispatch: ReturnType<typeof useDispatch>,
    context: ReturnType<typeof buildFromDashboard>,
    used: RefObject<boolean>,
) {
    if (context) {
        dispatch(setAmbientUserContextAction({ userContext: context }));
        used.current = true;
    }
    if (!context && used.current) {
        dispatch(setAmbientUserContextAction({ userContext: undefined }));
        used.current = false;
    }
}

function buildFromDashboard(dashboardSelector: DashboardSelectorEvaluator) {
    const dashboardId = selectWithDefault(dashboardSelector, selectDashboardId, "new-dashboard");
    const dashboardTitle = selectWithDefault(dashboardSelector, selectDashboardTitle, "");
    const isNewDashboard = selectWithDefault(dashboardSelector, selectIsNewDashboard, false);

    const filterContextItems = selectWithDefault(dashboardSelector, selectFilterContextFilters, []);
    const displayForms = selectWithDefault(
        dashboardSelector,
        selectAttributeFilterDisplayFormsMap,
        newDisplayFormMap([]),
    );

    const widgetsMap = selectWithDefault(
        dashboardSelector,
        selectWidgetsMap,
        newMapForObjectWithIdentity<ExtendedDashboardWidget>([]),
    );
    const activeTab = selectWithOptional(dashboardSelector, selectActiveTab);
    const workingDefinition = selectWithOptional(dashboardSelector, selectDashboardWorkingDefinition);
    const visualizationSwitcherActiveVisualizations = selectWithDefault(
        dashboardSelector,
        selectVisualizationSwitcherActiveVisualizations,
        {},
    );

    const resultsEnvelopes = dashboardSelector((state) => state.executionResults.entities);
    const results = Object.entries(resultsEnvelopes).reduce((acc, [key, value]) => {
        acc.set(key, value.executionResult?.resultId() ?? undefined);
        return acc;
    }, new Map<string, string | undefined>());

    const filters = buildFiltersContext(filterContextItems ?? [], displayForms);
    const { widgets } = buildWidgetsContext(
        widgetsMap as unknown as Map<ObjRef, IWidget>,
        results,
        visualizationSwitcherActiveVisualizations,
    );

    return mergeContexts(
        buildDashboardContext(
            {
                ref: idRef(dashboardId, "analyticalDashboard"),
                isNew: isNewDashboard,
                title: dashboardTitle,
                widgets,
                filters,
                ...(activeTab ? { activeTabId: activeTab.localIdentifier } : {}),
            },
            workingDefinition,
        ),
    );
}

function selectWithDefault<T>(
    dashboardSelector: DashboardSelectorEvaluator,
    selector: DashboardSelector<T>,
    defaultValue: NonNullable<T>,
): NonNullable<T> {
    try {
        return dashboardSelector(selector) ?? defaultValue;
    } catch {
        return defaultValue;
    }
}

function selectWithOptional<T>(
    dashboardSelector: DashboardSelectorEvaluator,
    selector: DashboardSelector<T>,
): T | undefined {
    try {
        return dashboardSelector(selector);
    } catch {
        return undefined;
    }
}
