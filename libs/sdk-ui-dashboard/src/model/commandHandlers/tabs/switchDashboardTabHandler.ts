// (C) 2025 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { IAttributeDisplayFormMetadataObject, IDashboardTab, ObjRef } from "@gooddata/sdk-model";

import { SwitchDashboardTab } from "../../commands/tabs.js";
import { DashboardTabSwitched, dashboardTabSwitched } from "../../events/tabs.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { attributeFilterConfigsActions } from "../../store/attributeFilterConfigs/index.js";
import { selectDateFilterConfigOverrides } from "../../store/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectDateFilterConfigsOverrides } from "../../store/dateFilterConfigs/dateFilterConfigsSelectors.js";
import { dateFilterConfigsActions } from "../../store/dateFilterConfigs/index.js";
import { selectFilterContextDefinition } from "../../store/filterContext/filterContextSelectors.js";
import { filterContextActions } from "../../store/filterContext/index.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabId, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { resolveFilterDisplayForms } from "../../utils/filterResolver.js";

/**
 * @internal
 */
export function* switchDashboardTabHandler(
    ctx: DashboardContext,
    cmd: SwitchDashboardTab,
): SagaIterator<DashboardTabSwitched> {
    const { tabId } = cmd.payload;

    // 1. Get current state from main dashboard slices
    const currentActiveTabId: ReturnType<typeof selectActiveTabId> = yield select(selectActiveTabId);
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const currentLayout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const currentFilterContext: ReturnType<typeof selectFilterContextDefinition> = yield select(
        selectFilterContextDefinition,
    );
    const currentDateFilterConfig: ReturnType<typeof selectDateFilterConfigOverrides> = yield select(
        selectDateFilterConfigOverrides,
    );
    const currentDateFilterConfigs: ReturnType<typeof selectDateFilterConfigsOverrides> = yield select(
        selectDateFilterConfigsOverrides,
    );
    const currentAttributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides> =
        yield select(selectAttributeFilterConfigsOverrides);

    // 2. Find current and new tabs
    const currentTab = currentActiveTabId
        ? tabs?.find((t) => t.identifier === currentActiveTabId)
        : undefined;
    const newTab = tabs?.find((t) => t.identifier === tabId);

    if (!newTab) {
        throw new Error(`Tab with id "${tabId}" not found`);
    }

    // 3. Prepare batch of actions
    const actions = [];

    // 4. Save current state back to the old tab (if exists)
    if (currentTab && currentFilterContext) {
        // Convert IFilterContextDefinition back to IFilterContext format for storage in tab
        const filterContextForTab = {
            ...currentTab.filterContext,
            filters: currentFilterContext.filters || [],
        };

        const updatedOldTab: IDashboardTab<ExtendedDashboardWidget> = {
            ...currentTab,
            layout: currentLayout,
            filterContext: filterContextForTab,
            ...(currentDateFilterConfig ? { dateFilterConfig: currentDateFilterConfig } : {}),
            ...(currentDateFilterConfigs && currentDateFilterConfigs.length > 0
                ? { dateFilterConfigs: currentDateFilterConfigs }
                : {}),
            ...(currentAttributeFilterConfigs && currentAttributeFilterConfigs.length > 0
                ? { attributeFilterConfigs: currentAttributeFilterConfigs }
                : {}),
        };

        actions.push(tabsActions.updateTab(updatedOldTab));
    }

    // 5. Set new active tab
    actions.push(tabsActions.setActiveTabId(newTab.identifier));

    // 6. Load new tab's layout into main slice
    if (newTab.layout) {
        actions.push(layoutActions.setLayout(newTab.layout));
    }

    // 7. Load new tab's filter context into main slice
    if (newTab.filterContext) {
        // Handle both IFilterContext and ITempFilterContext
        const isTempContext = "created" in newTab.filterContext;
        const filterContext = newTab.filterContext as any;

        // Convert to IFilterContextDefinition
        const filterContextDefinition = {
            title: isTempContext ? "" : filterContext.title || "",
            description: isTempContext ? "" : filterContext.description || "",
            filters: newTab.filterContext.filters || [],
        };

        const filterContextIdentity =
            "ref" in newTab.filterContext && newTab.filterContext.ref
                ? {
                      ref: newTab.filterContext.ref,
                      identifier: isTempContext ? "" : filterContext.identifier || "",
                      uri: newTab.filterContext.uri,
                  }
                : undefined;

        // Get display as labels from attribute filter configs
        const displayAsLabels: ObjRef[] =
            newTab.attributeFilterConfigs
                ?.map((config) => config.displayAsLabel)
                ?.filter((label): label is ObjRef => label !== undefined) ?? [];

        // Resolve display forms for the new tab's filters
        const attributeFilterDisplayForms: IAttributeDisplayFormMetadataObject[] = yield call(
            resolveFilterDisplayForms,
            ctx,
            filterContextDefinition.filters,
            displayAsLabels,
        );

        actions.push(
            filterContextActions.setFilterContext({
                filterContextDefinition,
                originalFilterContextDefinition: filterContextDefinition,
                filterContextIdentity,
                attributeFilterDisplayForms,
            }),
        );
    }

    // 8. Load new tab's date filter configs
    if (newTab.dateFilterConfigs) {
        actions.push(
            dateFilterConfigsActions.setDateFilterConfigs({
                dateFilterConfigs: newTab.dateFilterConfigs,
            }),
        );
    }

    // 9. Load new tab's attribute filter configs
    if (newTab.attributeFilterConfigs) {
        actions.push(
            attributeFilterConfigsActions.setAttributeFilterConfigs({
                attributeFilterConfigs: newTab.attributeFilterConfigs,
            }),
        );
    }

    // 10. Clear layout history (similar to render mode change)
    actions.push(layoutActions.clearLayoutHistory());

    // 11. Dispatch all actions in a batch
    yield put(batchActions(actions));

    // 12. Return event
    return dashboardTabSwitched(ctx, currentActiveTabId, tabId, cmd.correlationId);
}
