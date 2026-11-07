// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { normalizeDashboardTimezoneConfig } from "@gooddata/sdk-model";
import { _isEqual } from "@gooddata/util";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import {
    selectDashboardPersistentFiltersAcrossTabs,
    selectDashboardTimezoneConfig,
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
    selectDisableDashboardUserFilterSave,
    selectDisableFilterViews,
    selectEvaluationFrequency,
    selectSectionHeadersDateDataSet,
} from "../../model/store/meta/metaSelectors.js";

import { type IDashboardSettingsApplyPayload } from "./types.js";

export function useDialogData() {
    const disableCrossFiltering = useDashboardSelector(selectDisableDashboardCrossFiltering) ?? false;
    const disableUserFilterReset = useDashboardSelector(selectDisableDashboardUserFilterReset) ?? false;
    const disableFilterViews = useDashboardSelector(selectDisableFilterViews) ?? false;
    const disableUserFilterSave = useDashboardSelector(selectDisableDashboardUserFilterSave) ?? false;
    const enablePersistentFiltersAcrossTabs = useDashboardSelector(
        selectDashboardPersistentFiltersAcrossTabs,
    );
    const evaluationFrequency = useDashboardSelector(selectEvaluationFrequency) ?? undefined;
    const sectionHeadersDateDataSet = useDashboardSelector(selectSectionHeadersDateDataSet) ?? undefined;
    const timezoneConfig = normalizeDashboardTimezoneConfig(
        useDashboardSelector(selectDashboardTimezoneConfig),
    );

    const [currentData, setCurrentData] = useState<IDashboardSettingsApplyPayload>({
        disableCrossFiltering,
        disableUserFilterSave,
        disableUserFilterReset,
        disableFilterViews,
        enablePersistentFiltersAcrossTabs,
        evaluationFrequency,
        sectionHeadersDateDataSet,
        timezoneConfig,
    });

    const [originalData] = useState(currentData);

    return {
        currentData,
        originalData,
        setCurrentData,
        isDirty: () => !_isEqual(currentData, originalData),
    };
}
