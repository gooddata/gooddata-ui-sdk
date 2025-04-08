// (C) 2025 GoodData Corporation
import { useState } from "react";
import isEqual from "lodash/isEqual.js";

import {
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
    selectDisableDashboardUserFilterSave,
    selectDisableFilterViews,
    useDashboardSelector,
} from "../../model/index.js";

export function useDialogData() {
    const disableCrossFiltering = useDashboardSelector(selectDisableDashboardCrossFiltering) ?? false;
    const disableUserFilterReset = useDashboardSelector(selectDisableDashboardUserFilterReset) ?? false;
    const disableFilterViews = useDashboardSelector(selectDisableFilterViews) ?? false;
    const disableUserFilterSave = useDashboardSelector(selectDisableDashboardUserFilterSave) ?? false;

    const [currentData, setCurrentData] = useState({
        disableCrossFiltering,
        disableUserFilterSave,
        disableUserFilterReset,
        disableFilterViews,
    });

    const [originalData] = useState(currentData);

    return {
        currentData,
        originalData,
        setCurrentData,
        isDirty: () => !isEqual(currentData, originalData),
    };
}
