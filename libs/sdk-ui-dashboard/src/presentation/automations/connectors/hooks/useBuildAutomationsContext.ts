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
} from "../../../../model/store/catalog/catalogSelectors.js";
import {
    selectEnableAlertAttributes,
    selectEnableAlertOncePerInterval,
    selectEnableAnomalyDetectionAlert,
    selectEnableAutomationManagement,
    selectEnableComparisonInAlerting,
    selectEnableExternalRecipients,
    selectEnableNewScheduledExport,
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
import { selectPersistedDashboardFilterContextDateFilterConfig } from "../../../../model/store/meta/metaSelectors.js";
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
    selectMeasureValueFilterConfigsOverrides,
    selectMeasureValueFilterConfigsOverridesByTab,
} from "../../../../model/store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js";
import { selectIsAutomationDialogSecondaryTitleVisible } from "../../../../model/store/topBar/topBarSelectors.js";
import { selectExecutionTimestamp } from "../../../../model/store/ui/uiSelectors.js";
import { selectCurrentUser } from "../../../../model/store/user/userSelectors.js";
import type {
    IAutomationsContextValue,
    IAutomationsDateFilterConfig,
} from "../../contexts/AutomationsContext.js";

const DEFAULT_MIN_RECURRENCE_MINUTES = "60";

export function useBuildAutomationsContext(): IAutomationsContextValue {
    const locale = useDashboardSelector(selectLocale);
    const separators = useDashboardSelector(selectSeparators);
    const enableNewScheduledExport = useDashboardSelector(selectEnableNewScheduledExport);
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
    const timezone = useDashboardSelector(selectTimezone);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const isSecondaryTitleVisible = useDashboardSelector(selectIsAutomationDialogSecondaryTitleVisible);
    const externalRecipient = useDashboardSelector(selectExternalRecipient);
    const enableAlertOncePerInterval = useDashboardSelector(selectEnableAlertOncePerInterval);
    const enableAnomalyDetectionAlert = useDashboardSelector(selectEnableAnomalyDetectionAlert);
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);
    const canUseAiAssistant = useDashboardSelector(selectCanUseAiAssistant);
    const canManageWorkspace = useDashboardSelector(selectCanManageWorkspace);
    const enableComparisonInAlerting = useDashboardSelector(selectEnableComparisonInAlerting);
    const enableExternalRecipients = useDashboardSelector(selectEnableExternalRecipients);
    const enableAlertAttributes = useDashboardSelector(selectEnableAlertAttributes);
    const maxAutomationsRecipients = useDashboardSelector(selectMaxAutomationRecipients);
    const minimumRecurrenceMinutesEntitlement = useDashboardSelector(
        selectEntitlementMinimumRecurrenceMinutes,
    );
    const allowHourlyRecurrence =
        parseInt(minimumRecurrenceMinutesEntitlement?.value ?? DEFAULT_MIN_RECURRENCE_MINUTES, 10) === 60;
    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const isExecutionTimestampMode = !!executionTimestamp;

    const getCatalogAttributeByRef = useCallback(
        (ref: ObjRef) => allCatalogAttributesMap.get(ref),
        [allCatalogAttributesMap],
    );
    const getAttributeFilterDisplayForm = useCallback(
        (displayForm: ObjRef) =>
            attrFilterDisplayFormsMap.get(displayForm) ?? catalogDisplayFormsMap.get(displayForm),
        [attrFilterDisplayFormsMap, catalogDisplayFormsMap],
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

    const features = useMemo(
        () => ({
            canCreateAutomation,
            enableAlertOncePerInterval,
            enableAnomalyDetectionAlert,
            enableAutomationManagement,
            canUseAiAssistant,
            enableComparisonInAlerting,
            enableExternalRecipients,
            enableAlertAttributes,
            canManageWorkspace,
        }),
        [
            canCreateAutomation,
            enableAlertOncePerInterval,
            enableAnomalyDetectionAlert,
            enableAutomationManagement,
            canUseAiAssistant,
            enableComparisonInAlerting,
            enableExternalRecipients,
            enableAlertAttributes,
            canManageWorkspace,
        ],
    );

    return useMemo(
        () => ({
            locale,
            separators,
            settings,
            enableNewScheduledExport,
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
            isWhiteLabeled,
            isSecondaryTitleVisible,
            externalRecipient,
            features,
            getCatalogAttributeByRef,
            getAttributeFilterDisplayForm,
        }),
        [
            locale,
            separators,
            settings,
            enableNewScheduledExport,
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
            isWhiteLabeled,
            isSecondaryTitleVisible,
            externalRecipient,
            features,
            getCatalogAttributeByRef,
            getAttributeFilterDisplayForm,
        ],
    );
}
