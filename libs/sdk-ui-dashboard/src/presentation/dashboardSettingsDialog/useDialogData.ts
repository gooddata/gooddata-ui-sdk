// (C) 2025 GoodData Corporation
import { useState } from "react";
import isEqual from "lodash/isEqual.js";

import {
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
    selectDisableDashboardUserFilterSave,
    selectEvaluationFrequency,
    selectDisableFilterViews,
    useDashboardSelector,
} from "../../model/index.js";

export function useDialogData() {
    const disableCrossFiltering = useDashboardSelector(selectDisableDashboardCrossFiltering) ?? false;
    const disableUserFilterReset = useDashboardSelector(selectDisableDashboardUserFilterReset) ?? false;
    const disableFilterViews = useDashboardSelector(selectDisableFilterViews) ?? false;
    const disableUserFilterSave = useDashboardSelector(selectDisableDashboardUserFilterSave) ?? false;
    const evaluationFrequency = useDashboardSelector(selectEvaluationFrequency) ?? undefined;

    const [currentData, setCurrentData] = useState({
        disableCrossFiltering,
        disableUserFilterSave,
        disableUserFilterReset,
        disableFilterViews,
        evaluationFrequency,
    });

    const [originalData] = useState(currentData);

    return {
        currentData,
        originalData,
        setCurrentData,
        isDirty: () => !isEqual(currentData, originalData),
    };
}
