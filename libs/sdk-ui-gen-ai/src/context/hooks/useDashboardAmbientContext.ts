// (C) 2026 GoodData Corporation

import { type RefObject, useEffect, useRef } from "react";

import { useDispatch } from "react-redux";

import { type IWidget, type ObjRef, idRef, serializeObjRef } from "@gooddata/sdk-model";
import {
    type DashboardSelector,
    type DashboardSelectorEvaluator,
    newDisplayFormMap,
    selectActiveTab,
    selectAllFiltersForWidgetByRefAcrossTabs,
    selectAllTabsWidgetContexts,
    selectAttributeFilterDisplayFormsMap,
    selectDashboardId,
    selectDashboardTitle,
    selectDashboardWorkingDefinition,
    selectFilterContextFilters,
    selectIsNewDashboard,
    selectVisualizationSwitcherActiveVisualizations,
} from "@gooddata/sdk-ui-dashboard";
import { dashboardFilterToFilterContextItem } from "@gooddata/sdk-ui-dashboard/internal";

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

    const widgetContexts = selectWithDefault(dashboardSelector, selectAllTabsWidgetContexts, []);
    const widgetsMap = new Map<ObjRef, IWidget>();
    const widgetFiltersMap = new Map<string, ReturnType<typeof buildFiltersContext>>();

    for (const context of widgetContexts) {
        widgetsMap.set(context.widget.ref, context.widget as IWidget);
        const [commonDateFilters, otherFilters] = dashboardSelector(
            selectAllFiltersForWidgetByRefAcrossTabs(context.widget.ref),
        );
        widgetFiltersMap.set(
            serializeObjRef(context.widget.ref),
            buildFiltersContext(
                [...commonDateFilters, ...otherFilters]
                    .map((f) => dashboardFilterToFilterContextItem(f, true))
                    .filter((f) => !!f),
                displayForms,
            ),
        );
    }

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
        widgetsMap,
        results,
        visualizationSwitcherActiveVisualizations,
        undefined,
        widgetFiltersMap,
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
