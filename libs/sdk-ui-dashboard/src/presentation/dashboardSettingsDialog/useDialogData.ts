// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { isEqual } from "lodash-es";

import { type IDashboardSettingsApplyPayload } from "./types.js";
import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import {
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
    selectDisableDashboardUserFilterSave,
    selectDisableFilterViews,
    selectEvaluationFrequency,
    selectSectionHeadersDateDataSet,
} from "../../model/store/meta/metaSelectors.js";

export function useDialogData() {
    const disableCrossFiltering = useDashboardSelector(selectDisableDashboardCrossFiltering) ?? false;
    const disableUserFilterReset = useDashboardSelector(selectDisableDashboardUserFilterReset) ?? false;
    const disableFilterViews = useDashboardSelector(selectDisableFilterViews) ?? false;
    const disableUserFilterSave = useDashboardSelector(selectDisableDashboardUserFilterSave) ?? false;
    const evaluationFrequency = useDashboardSelector(selectEvaluationFrequency) ?? undefined;
    const sectionHeadersDateDataSet = useDashboardSelector(selectSectionHeadersDateDataSet) ?? undefined;

    const [currentData, setCurrentData] = useState<IDashboardSettingsApplyPayload>({
        disableCrossFiltering,
        disableUserFilterSave,
        disableUserFilterReset,
        disableFilterViews,
        evaluationFrequency,
        sectionHeadersDateDataSet,
    });

    const [originalData] = useState(currentData);

    return {
        currentData,
        originalData,
        setCurrentData,
        isDirty: () => !isEqual(currentData, originalData),
    };
}
