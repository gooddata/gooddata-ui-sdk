// (C) 2025-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { v4 as uuid } from "uuid";

import {
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardLayout,
    type IDateFilterConfig,
    type IFilterContextDefinition,
    type ScreenSize,
} from "@gooddata/sdk-model";

import { switchDashboardTabHandler } from "./switchDashboardTabHandler.js";
import { createDefaultFilterContext } from "../../../_staging/dashboard/defaultFilterContext.js";
import { DEFAULT_FISCAL_DATE_FILTER_PRESET } from "../../../_staging/dateFilterConfig/defaultConfig.js";
import { type ICreateDashboardTab, switchDashboardTab } from "../../commands/tabs.js";
import { type IDashboardTabSwitched, dashboardTabCreated } from "../../events/tabs.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { InitialUndoState } from "../../store/_infra/undoEnhancer.js";
import { selectActiveCalendars, selectDateFilterConfig } from "../../store/config/configSelectors.js";
import { type ITabState, tabsActions } from "../../store/tabs/index.js";
import { selectScreen } from "../../store/tabs/layout/layoutSelectors.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { EmptyDashboardLayout } from "../dashboard/common/dashboardInitialize.js";

const getTabState = ({
    title,
    localIdentifier,
    isRenaming,
    filterContext,
    dateFilterConfig,
    dateFilterConfigs,
    attributeFilterConfigs,
    layout,
    screen,
}: {
    title: string;
    localIdentifier: string;
    isRenaming?: boolean;
    filterContext: IFilterContextDefinition;
    dateFilterConfig?: IDateFilterConfig;
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
    layout: IDashboardLayout<ExtendedDashboardWidget>;
    screen: ScreenSize;
}): ITabState => {
    return {
        title,
        localIdentifier,
        isRenaming,
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
export function* createDashboardTabHandler(ctx: DashboardContext, cmd: ICreateDashboardTab): SagaIterator {
    const { title = "", index, shouldStartRenaming = true } = cmd.payload;

    // 1. Get current state from main dashboard slices
    const tabs: ReturnType<typeof selectTabs> = yield select(selectTabs);
    const activeTabLocalIdentifier: ReturnType<typeof selectActiveTabLocalIdentifier> = yield select(
        selectActiveTabLocalIdentifier,
    );
    const dateFilterConfig: ReturnType<typeof selectDateFilterConfig> = yield select(selectDateFilterConfig);
    const activeCalendars: ReturnType<typeof selectActiveCalendars> = yield select(selectActiveCalendars);

    const screen: ScreenSize = yield select(selectScreen);

    const updatedTabs = (tabs ?? []).slice();

    // 2. Create new tab with an empty filter context and layout
    const effectiveDateFilterConfig =
        activeCalendars?.default === "FISCAL"
            ? { ...dateFilterConfig, selectedOption: DEFAULT_FISCAL_DATE_FILTER_PRESET }
            : dateFilterConfig;

    const newTabId = uuid();
    const newTabFilterContext = createDefaultFilterContext(effectiveDateFilterConfig, true);

    const newTab: ITabState = getTabState({
        localIdentifier: newTabId,
        title,
        layout: EmptyDashboardLayout,
        screen,
        filterContext: newTabFilterContext,
        dateFilterConfig,
        isRenaming: shouldStartRenaming,
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
            activeTabLocalIdentifier,
        }),
    );

    // 6. Emit created event
    yield dispatchDashboardEvent(dashboardTabCreated(ctx, newTabId, insertionIndex, cmd.correlationId));

    // 7. Switch to the newly created tab
    const switchedEvent: IDashboardTabSwitched = yield call(
        switchDashboardTabHandler,
        ctx,
        switchDashboardTab(newTabId, cmd.correlationId),
    );
    // Important: explicitly dispatch the switched event so app-level sagas can sync URL
    yield dispatchDashboardEvent(switchedEvent);
}
