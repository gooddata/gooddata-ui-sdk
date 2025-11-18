// (C) 2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { v4 as uuid } from "uuid";

import {
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfigItem,
    IDashboardLayout,
    IDateFilterConfig,
    IFilterContextDefinition,
    ScreenSize,
} from "@gooddata/sdk-model";

import { switchDashboardTabHandler } from "./switchDashboardTabHandler.js";
import { createDefaultFilterContext } from "../../../_staging/dashboard/defaultFilterContext.js";
import { CreateDashboardTab, switchDashboardTab } from "../../commands/tabs.js";
import { DashboardTabSwitched, dashboardTabCreated } from "../../events/tabs.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { InitialUndoState } from "../../store/_infra/undoEnhancer.js";
import { selectDateFilterConfig } from "../../store/config/configSelectors.js";
import { TabState, tabsActions } from "../../store/tabs/index.js";
import { selectScreen } from "../../store/tabs/layout/layoutSelectors.js";
import { selectActiveTabId, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { EmptyDashboardLayout } from "../dashboard/common/dashboardInitialize.js";

const getTabState = ({
    title,
    identifier,
    filterContext,
    dateFilterConfig,
    dateFilterConfigs,
    attributeFilterConfigs,
    layout,
    screen,
}: {
    title: string;
    identifier: string;
    filterContext: IFilterContextDefinition;
    dateFilterConfig?: IDateFilterConfig;
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
    layout: IDashboardLayout<ExtendedDashboardWidget>;
    screen: ScreenSize;
}): TabState => {
    return {
        title,
        identifier,
        filterContext: {
            filtersWithInvalidSelection: [],
            filterContextDefinition: filterContext,
        },
        dateFilterConfig: {
            dateFilterConfig: undefined,
            effectiveDateFilterConfig: dateFilterConfig,
            isUsingDashboardOverrides: false,
            dateFilterConfigValidationWarnings: undefined,
        },
        dateFilterConfigs: {
            dateFilterConfigs,
        },
        attributeFilterConfigs: {
            attributeFilterConfigs,
        },
        layout: {
            layout: layout,
            stash: {},
            screen,
            ...InitialUndoState,
        },
    };
};

/**
 * @internal
 */
export function* createDashboardTabHandler(ctx: DashboardContext, cmd: CreateDashboardTab): SagaIterator {
    const { title = "", index } = cmd.payload;

    // 1. Get current state from main dashboard slices
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const activeTabId: ReturnType<typeof selectActiveTabId> = yield select(selectActiveTabId);
    const dateFilterConfig: ReturnType<typeof selectDateFilterConfig> = yield select(selectDateFilterConfig);

    const screen: ScreenSize = yield select(selectScreen);

    const updatedTabs = (tabs ?? []).slice();

    // 2. Create new tab with an empty filter context and layout
    const newTabId = uuid();
    const newTabFilterContext = createDefaultFilterContext(dateFilterConfig, true);

    const newTab: TabState = getTabState({
        identifier: newTabId,
        title,
        layout: EmptyDashboardLayout,
        screen,
        filterContext: newTabFilterContext,
        dateFilterConfig,
    });

    // 4. Insert new tab at specified index (or append)
    const insertionIndex = Math.max(
        0,
        Math.min(
            typeof index === "number" && Number.isInteger(index) ? index : updatedTabs.length,
            updatedTabs.length,
        ),
    );
    updatedTabs.splice(insertionIndex, 0, newTab);

    // 5. Persist tabs with current active id, the new tab will be switched to later
    yield put(
        tabsActions.setTabs({
            tabs: updatedTabs,
            activeTabId,
        }),
    );

    // 6. Emit created event
    yield dispatchDashboardEvent(dashboardTabCreated(ctx, newTabId, insertionIndex, cmd.correlationId));

    // 7. Switch to the newly created tab
    const switchedEvent: DashboardTabSwitched = yield call(
        switchDashboardTabHandler,
        ctx,
        switchDashboardTab(newTabId, cmd.correlationId),
    );
    // Important: explicitly dispatch the switched event so app-level sagas can sync URL
    yield dispatchDashboardEvent(switchedEvent);
}
