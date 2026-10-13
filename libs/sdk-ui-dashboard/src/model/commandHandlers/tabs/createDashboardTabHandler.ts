// (C) 2025-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardFilterGroupsConfig,
    type IDashboardLayout,
    type IDashboardMeasureValueFilterConfig,
    type IDateFilterConfig,
    type IFilterContextDefinition,
    type ScreenSize,
} from "@gooddata/sdk-model";

import { createDefaultFilterContext } from "../../../_staging/dashboard/defaultFilterContext.js";
import { DEFAULT_FISCAL_DATE_FILTER_PRESET } from "../../../_staging/dateFilterConfig/defaultConfig.js";
import { deriveAbsoluteFormGranularitiesFromRelativeForm } from "../../../_staging/dateFilterConfig/merge.js";
import { configHasFiscalPresets } from "../../../_staging/dateFilterConfig/validation.js";
import { type ICreateDashboardTab, switchDashboardTab } from "../../commands/tabs.js";
import { type IDashboardTabSwitched, dashboardTabCreated } from "../../events/tabs.js";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher.js";
import { InitialUndoState } from "../../store/_infra/undoEnhancer.js";
import {
    selectActiveCalendars,
    selectDateFilterConfig,
    selectSettings,
} from "../../store/config/configSelectors.js";
import { selectCrossFilteringFiltersLocalIdentifiersByTab } from "../../store/drill/drillSelectors.js";
import { selectEnablePersistentFiltersAcrossTabs } from "../../store/meta/metaSelectors.js";
import { seedSyncedTabFilters } from "../../store/tabs/filterContext/filterSync.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectScreen } from "../../store/tabs/layout/layoutSelectors.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { type ITabState } from "../../store/tabs/tabsState.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { generateTabLocalIdentifier } from "../../utils/tabLocalIdentifier.js";
import { EmptyDashboardLayout } from "../dashboard/common/dashboardInitialize.js";

import { switchDashboardTabHandler } from "./switchDashboardTabHandler.js";

const getTabState = ({
    title,
    localIdentifier,
    isRenaming,
    filterContext,
    originalFilterContext,
    attributeFilterDisplayForms,
    dateFilterConfig,
    dateFilterConfigs,
    attributeFilterConfigs,
    measureValueFilterConfigs,
    filterGroupsConfig,
    layout,
    screen,
}: {
    title: string;
    localIdentifier: string;
    isRenaming?: boolean;
    filterContext: IFilterContextDefinition;
    originalFilterContext?: IFilterContextDefinition;
    attributeFilterDisplayForms?: IAttributeDisplayFormMetadataObject[];
    dateFilterConfig?: IDateFilterConfig;
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
    measureValueFilterConfigs?: IDashboardMeasureValueFilterConfig[];
    filterGroupsConfig?: IDashboardFilterGroupsConfig;
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
            originalFilterContextDefinition: originalFilterContext,
            attributeFilterDisplayForms,
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
        measureValueFilterConfigs: {
            measureValueFilterConfigs,
        },
        filterGroupsConfig,
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
    const rawDateFilterConfig: ReturnType<typeof selectDateFilterConfig> =
        yield select(selectDateFilterConfig);
    const settings: ReturnType<typeof selectSettings> = yield select(selectSettings);
    const dateFilterConfig = deriveAbsoluteFormGranularitiesFromRelativeForm(
        rawDateFilterConfig,
        !!settings.enableAbsoluteDateFilterGranularity,
    );
    const activeCalendars: ReturnType<typeof selectActiveCalendars> = yield select(selectActiveCalendars);

    const screen: ScreenSize = yield select(selectScreen);

    const updatedTabs = (tabs ?? []).slice();

    // 2. Create new tab with an empty layout and a default filter context (seeded from the active tab when filters sync across tabs)
    const effectiveDateFilterConfig =
        activeCalendars?.fiscal &&
        activeCalendars?.default === "FISCAL" &&
        configHasFiscalPresets(dateFilterConfig)
            ? { ...dateFilterConfig, selectedOption: DEFAULT_FISCAL_DATE_FILTER_PRESET }
            : dateFilterConfig;

    const newTabId = generateTabLocalIdentifier();
    const newTabFilterContext = createDefaultFilterContext(effectiveDateFilterConfig, true);

    // Synced writes only update existing counterparts and reset needs originals to restore to,
    // so a tab created while sync is on must start with the synced filters as its saved state.
    const activeTab = tabs?.find((tab) => tab.localIdentifier === activeTabLocalIdentifier);
    const crossFilteringLocalIdsByTab: ReturnType<typeof selectCrossFilteringFiltersLocalIdentifiersByTab> =
        yield select(selectCrossFilteringFiltersLocalIdentifiersByTab);
    const enablePersistentFiltersAcrossTabs: ReturnType<typeof selectEnablePersistentFiltersAcrossTabs> =
        yield select(selectEnablePersistentFiltersAcrossTabs);
    const seed =
        enablePersistentFiltersAcrossTabs && activeTab
            ? seedSyncedTabFilters(activeTab, newTabFilterContext, crossFilteringLocalIdsByTab)
            : undefined;

    const newTab: ITabState = getTabState({
        localIdentifier: newTabId,
        title,
        layout: EmptyDashboardLayout,
        screen,
        filterContext: seed?.filterContextDefinition ?? newTabFilterContext,
        originalFilterContext: seed ? cloneDeep(seed.filterContextDefinition) : undefined,
        attributeFilterDisplayForms: seed?.attributeFilterDisplayForms,
        dateFilterConfig,
        dateFilterConfigs: seed?.dateFilterConfigs,
        attributeFilterConfigs: seed?.attributeFilterConfigs,
        measureValueFilterConfigs: seed?.measureValueFilterConfigs,
        filterGroupsConfig: seed?.filterGroupsConfig,
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
