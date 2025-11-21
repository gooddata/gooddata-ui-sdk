// (C) 2025 GoodData Corporation

import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { IFilterContext } from "@gooddata/sdk-model";

import { SwitchDashboardTab } from "../../commands/tabs.js";
import { DashboardTabSwitched, dashboardTabSwitched } from "../../events/tabs.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { selectFilterViews } from "../../store/filterViews/filterViewsReducersSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { changeFilterContextSelection } from "../dashboard/common/filterViews.js";

/**
 * @internal
 */
export function* switchDashboardTabHandler(
    ctx: DashboardContext,
    cmd: SwitchDashboardTab,
): SagaIterator<DashboardTabSwitched> {
    const { tabId } = cmd.payload;

    const currentActiveTabId: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);

    const newTab = tabs?.find((t) => t.localIdentifier === tabId);

    if (!newTab) {
        throw new Error(`Tab with id "${tabId}" not found`);
    }

    const actions = [];

    actions.push(tabsActions.setActiveTabLocalIdentifier(newTab.localIdentifier));
    actions.push(tabsActions.clearLayoutHistory());

    yield put(batchActions(actions));

    // Apply default filter view for the new tab if one exists, otherwise reset to original
    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
    const areFilterViewsEnabled = settings.enableDashboardFilterViews;

    if (areFilterViewsEnabled && newTab.filterContext) {
        const filterViews: ReturnType<typeof selectFilterViews> = yield select(selectFilterViews);
        const tabDefaultView = filterViews.find(
            (view) => view.isDefault && view.tabLocalIdentifier === tabId,
        );

        let filterContextToApply: IFilterContext | undefined;

        if (tabDefaultView) {
            // Apply default filter view if one exists
            filterContextToApply = changeFilterContextSelection(
                newTab.filterContext.filterContextDefinition as IFilterContext,
                tabDefaultView.filterContext.filters,
            );
        } else if (newTab.filterContext.originalFilterContextDefinition) {
            // Reset to original filter context when no default view exists
            filterContextToApply = newTab.filterContext.originalFilterContextDefinition as IFilterContext;
        }

        if (filterContextToApply) {
            // Update the tab's filter context in the state
            yield put(
                tabsActions.setFilterContext({
                    filterContextDefinition: filterContextToApply,
                    originalFilterContextDefinition: newTab.filterContext.originalFilterContextDefinition,
                    filterContextIdentity: newTab.filterContext.filterContextIdentity,
                    attributeFilterDisplayForms: newTab.filterContext.attributeFilterDisplayForms ?? [],
                }),
            );
        }
    }

    return dashboardTabSwitched(ctx, currentActiveTabId, tabId, cmd.correlationId);
}
