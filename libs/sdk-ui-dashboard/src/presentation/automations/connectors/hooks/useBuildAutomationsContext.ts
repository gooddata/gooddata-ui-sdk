// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import type { ObjRef } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
    selectCatalogAttributes,
    selectCatalogDateDatasets,
    selectCatalogMeasures,
    selectCatalogParameters,
    selectCatalogParametersIsLoaded,
} from "../../../../model/store/catalog/catalogSelectors.js";
import {
    selectEnableAlertOncePerInterval,
    selectEnableAnomalyDetectionAlert,
    selectEnableAutomationEvaluationMode,
    selectEnableParameters,
    selectEnableSlideshowExports,
    selectEnableStringParameters,
    selectEnableTimezoneChange,
    selectExternalRecipient,
    selectIsWhiteLabeled,
    selectLocale,
    selectSeparators,
    selectSettings,
    selectTimezone,
    selectWeekStart,
} from "../../../../model/store/config/configSelectors.js";
import {
    selectEntitlementMinimumRecurrenceMinutes,
    selectMaxAutomationRecipients,
} from "../../../../model/store/entitlements/entitlementsSelectors.js";
import {
    selectAutomationAvailableDashboardFilters,
    selectAutomationCommonDateFilterId,
    selectAutomationDefaultSelectedFilters,
    selectAutomationFiltersByTab,
    selectDashboardFiltersWithoutCrossFiltering,
    selectDashboardHiddenFilters,
    selectDashboardLockedFilters,
} from "../../../../model/store/filtering/dashboardFilterSelectors.js";
import {
    selectDashboardTimezoneConfig,
    selectEffectiveDashboardTimezone,
    selectPersistedDashboardFilterContextDateFilterConfig,
    selectScheduledExportTimezone,
} from "../../../../model/store/meta/metaSelectors.js";
import {
    selectCanCreateAutomation,
    selectCanManageWorkspace,
    selectCanUseAiAssistant,
} from "../../../../model/store/permissions/permissionsSelectors.js";
import {
    selectAttributeFilterConfigsOverrides,
    selectAttributeFilterConfigsOverridesByTab,
    selectAttributeFilterConfigsSelectionTypeMap,
    selectAttributeFilterConfigsSelectionTypeMapByTab,
} from "../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectDateFilterConfigOverridesByTab,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterGranularitiesPerTab,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterOptionsPerTab,
} from "../../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import {
    selectDateFilterConfigsOverrides,
    selectDateFilterConfigsOverridesByTab,
} from "../../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import { selectAttributeFilterDisplayFormsMap } from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import {
    selectWidgetLocalIdToTabIdMap,
    selectWidgetsMap,
} from "../../../../model/store/tabs/layout/layoutSelectors.js";
import {
    selectMeasureValueFilterConfigsOverrides,
    selectMeasureValueFilterConfigsOverridesByTab,
} from "../../../../model/store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { selectSmartPersistedTabsParameters } from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { selectTabs } from "../../../../model/store/tabs/tabsSelectors.js";
import {
    selectExecutionTimestamp,
    selectScheduleEmailDialogReturnFocusTo,
} from "../../../../model/store/ui/uiSelectors.js";
import { selectCurrentUser } from "../../../../model/store/user/userSelectors.js";
import type {
    IAutomationsContextValue,
    IAutomationsDateFilterConfig,
    IAutomationsParameters,
} from "../../contexts/AutomationsContext.js";

const DEFAULT_MIN_RECURRENCE_MINUTES = "60";

export function useBuildAutomationsContext(): IAutomationsContextValue {
    const locale = useDashboardSelector(selectLocale);
    const separators = useDashboardSelector(selectSeparators);
    const settings = useDashboardSelector(selectSettings);
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);
    const catalogDateDatasets = useDashboardSelector(selectCatalogDateDatasets);

    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const granularitiesPerTab = useDashboardSelector(selectEffectiveDateFilterGranularitiesPerTab);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const optionsPerTab = useDashboardSelector(selectEffectiveDateFilterOptionsPerTab);

    const catalogMeasures = useDashboardSelector(selectCatalogMeasures);
    const allCatalogAttributesMap = useDashboardSelector(selectAllCatalogAttributesMap);
    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);
    const attrFilterDisplayFormsMap = useDashboardSelector(selectAttributeFilterDisplayFormsMap);
    const attributeFilterConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const attributeFilterConfigsByTab = useDashboardSelector(selectAttributeFilterConfigsOverridesByTab);
    const attributeFilterSelectionTypeMap = useDashboardSelector(
        selectAttributeFilterConfigsSelectionTypeMap,
    );
    const attributeFilterSelectionTypeMapByTab = useDashboardSelector(
        selectAttributeFilterConfigsSelectionTypeMapByTab,
    );
    const dateFilterConfigs = useDashboardSelector(selectDateFilterConfigsOverrides);
    const dateFilterConfigsByTab = useDashboardSelector(selectDateFilterConfigsOverridesByTab);
    const dateFilterConfigOverridesByTab = useDashboardSelector(selectDateFilterConfigOverridesByTab);
    const measureValueFilterConfigs = useDashboardSelector(selectMeasureValueFilterConfigsOverrides);
    const measureValueFilterConfigsByTab = useDashboardSelector(
        selectMeasureValueFilterConfigsOverridesByTab,
    );
    const dateFilterContextConfig = useDashboardSelector(
        selectPersistedDashboardFilterContextDateFilterConfig,
    );
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const lockedFilters = useDashboardSelector(selectDashboardLockedFilters);
    const hiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const availableFilters = useDashboardSelector(selectDashboardFiltersWithoutCrossFiltering);
    const automationFiltersByTab = useDashboardSelector(selectAutomationFiltersByTab);
    const defaultSelectedFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    const automationAvailableFilters = useDashboardSelector(selectAutomationAvailableDashboardFilters);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const weekStart = useDashboardSelector(selectWeekStart);
    // The custom dashboard timezone (view-mode override or dashboard configuration,
    // browser-detected resolved) wins over the workspace setting for everything automations do
    // with a timezone: schedule "Starts on", alert crons, and next-run display.
    const workspaceTimezone = useDashboardSelector(selectTimezone);
    const customTimezone = useDashboardSelector(selectEffectiveDashboardTimezone);
    const timezone = customTimezone ?? workspaceTimezone;
    // Inputs of the scheduled-export "Time zone" section, resolved here because the
    // scheduledEmail tree must not read the dashboard store itself.
    const isTimezoneChangeEnabled = useDashboardSelector(selectEnableTimezoneChange);
    const timezoneConfig = useDashboardSelector(selectDashboardTimezoneConfig);
    const scheduledExportTimezone = useDashboardSelector(selectScheduledExportTimezone);
    const exportTimezones = useMemo(
        () => ({
            isTimezoneFeatureEnabled: !!isTimezoneChangeEnabled,
            allowUserOverrideInViewMode: !!timezoneConfig?.allowUserOverrideInViewMode,
            configuredTimezoneId: timezoneConfig?.timezoneId,
            workspaceTimezone,
            effectiveTimezone: customTimezone,
            scheduledExportTimezone,
        }),
        [isTimezoneChangeEnabled, timezoneConfig, workspaceTimezone, customTimezone, scheduledExportTimezone],
    );
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const externalRecipient = useDashboardSelector(selectExternalRecipient);
    const enableAlertOncePerInterval = useDashboardSelector(selectEnableAlertOncePerInterval);
    const enableAnomalyDetectionAlert = useDashboardSelector(selectEnableAnomalyDetectionAlert);
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);
    const canUseAiAssistant = useDashboardSelector(selectCanUseAiAssistant);
    const canManageWorkspace = useDashboardSelector(selectCanManageWorkspace);
    const enableSlideshowExports = useDashboardSelector(selectEnableSlideshowExports);
    const enableAutomationEvaluationMode = useDashboardSelector(selectEnableAutomationEvaluationMode);
    const maxAutomationsRecipients = useDashboardSelector(selectMaxAutomationRecipients);
    const minimumRecurrenceMinutesEntitlement = useDashboardSelector(
        selectEntitlementMinimumRecurrenceMinutes,
    );
    const allowHourlyRecurrence =
        parseInt(minimumRecurrenceMinutesEntitlement?.value ?? DEFAULT_MIN_RECURRENCE_MINUTES, 10) === 60;
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const isExecutionTimestampMode = !!executionTimestamp;
    const scheduleEmailDialogReturnFocusTo = useDashboardSelector(selectScheduleEmailDialogReturnFocusTo);

    const widgetsMap = useDashboardSelector(selectWidgetsMap);

    const parametersEnabled = useDashboardSelector(selectEnableParameters);
    const stringParametersEnabled = useDashboardSelector(selectEnableStringParameters);
    const parameterCatalog = useDashboardSelector(selectCatalogParameters);
    const parameterCatalogIsLoaded = useDashboardSelector(selectCatalogParametersIsLoaded);
    const dashboardParametersByTab = useDashboardSelector(selectSmartPersistedTabsParameters);
    const tabs = useDashboardSelector(selectTabs);
    const widgetLocalIdToTabIdMap = useDashboardSelector(selectWidgetLocalIdToTabIdMap);

    const getCatalogAttributeByRef = useCallback(
        (ref: ObjRef) => allCatalogAttributesMap.get(ref),
        [allCatalogAttributesMap],
    );
    const getAttributeFilterDisplayForm = useCallback(
        (displayForm: ObjRef) =>
            attrFilterDisplayFormsMap.get(displayForm) ?? catalogDisplayFormsMap.get(displayForm),
        [attrFilterDisplayFormsMap, catalogDisplayFormsMap],
    );
    const widgetExistsByRef = useCallback(
        (ref: ObjRef | undefined): boolean => !!ref && widgetsMap.get(ref) !== undefined,
        [widgetsMap],
    );

    const dateFilterConfig: IAutomationsDateFilterConfig = useMemo(
        () => ({
            availableGranularities,
            dateFilterOptions,
            getGranularitiesForTab: (tabId: string) => granularitiesPerTab[tabId] ?? [],
            getOptionsForTab: (tabId: string) => optionsPerTab[tabId],
        }),
        [availableGranularities, dateFilterOptions, granularitiesPerTab, optionsPerTab],
    );

    // Memoized deliberately: `.map()` allocates, and an unstable `tabIds` would land in the
    // dependency array of the context useMemo below and change the whole context identity on
    // every render.
    const tabIds = useMemo(() => (tabs ?? []).map((tab) => tab.localIdentifier), [tabs]);

    const parameters: IAutomationsParameters = useMemo(
        () => ({
            enabled: parametersEnabled,
            stringParametersEnabled,
            catalog: parameterCatalog,
            catalogIsLoaded: parameterCatalogIsLoaded,
            dashboardParametersByTab,
        }),
        [
            parametersEnabled,
            stringParametersEnabled,
            parameterCatalog,
            parameterCatalogIsLoaded,
            dashboardParametersByTab,
        ],
    );

    const features = useMemo(
        () => ({
            canCreateAutomation,
            enableAlertOncePerInterval,
            enableAnomalyDetectionAlert,
            canUseAiAssistant,
            canManageWorkspace,
            enableSlideshowExports,
            enableAutomationEvaluationMode,
        }),
        [
            canCreateAutomation,
            enableAlertOncePerInterval,
            enableAnomalyDetectionAlert,
            canUseAiAssistant,
            canManageWorkspace,
            enableSlideshowExports,
            enableAutomationEvaluationMode,
        ],
    );

    return useMemo(
        () => ({
            locale,
            separators,
            settings,
            maxAutomationsRecipients,
            isExecutionTimestampMode,
            allowHourlyRecurrence,
            catalogAttributes,
            catalogDateDatasets,
            dateFilterConfig,
            catalogMeasures,
            attributeFilterConfigs,
            attributeFilterConfigsByTab,
            attributeFilterSelectionTypeMap,
            attributeFilterSelectionTypeMapByTab,
            dateFilterConfigs,
            dateFilterConfigsByTab,
            dateFilterConfigOverridesByTab,
            measureValueFilterConfigs,
            measureValueFilterConfigsByTab,
            dateFilterContextConfig,
            commonDateFilterId,
            lockedFilters,
            hiddenFilters,
            availableFilters,
            automationFiltersByTab,
            defaultSelectedFilters,
            automationAvailableFilters,
            currentUser,
            weekStart,
            timezone,
            exportTimezones,
            isWhiteLabeled,
            isSecondaryTitleVisible: true,
            externalRecipient,
            features,
            parameters,
            tabIds,
            widgetLocalIdToTabIdMap,
            getCatalogAttributeByRef,
            getAttributeFilterDisplayForm,
            widgetExistsByRef,
            scheduleEmailDialogReturnFocusTo,
        }),
        [
            locale,
            separators,
            settings,
            maxAutomationsRecipients,
            isExecutionTimestampMode,
            allowHourlyRecurrence,
            catalogAttributes,
            catalogDateDatasets,
            dateFilterConfig,
            catalogMeasures,
            attributeFilterConfigs,
            attributeFilterConfigsByTab,
            attributeFilterSelectionTypeMap,
            attributeFilterSelectionTypeMapByTab,
            dateFilterConfigs,
            dateFilterConfigsByTab,
            dateFilterConfigOverridesByTab,
            measureValueFilterConfigs,
            measureValueFilterConfigsByTab,
            dateFilterContextConfig,
            commonDateFilterId,
            lockedFilters,
            hiddenFilters,
            availableFilters,
            automationFiltersByTab,
            defaultSelectedFilters,
            automationAvailableFilters,
            currentUser,
            weekStart,
            timezone,
            exportTimezones,
            isWhiteLabeled,
            externalRecipient,
            features,
            parameters,
            tabIds,
            widgetLocalIdToTabIdMap,
            getCatalogAttributeByRef,
            getAttributeFilterDisplayForm,
            widgetExistsByRef,
            scheduleEmailDialogReturnFocusTo,
        ],
    );
}
