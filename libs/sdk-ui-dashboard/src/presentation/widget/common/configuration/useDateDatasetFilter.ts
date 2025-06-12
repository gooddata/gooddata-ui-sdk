// (C) 2022-2023 GoodData Corporation
import { useCallback, useEffect } from "react";
import { ICatalogDateDataset } from "@gooddata/sdk-model";
import {
    selectWidgetDateDatasetAutoSelect,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { getRecommendedCatalogDateDataset } from "../../../../_staging/dateDatasets/getRecommendedCatalogDateDataset.js";

export function useDateDatasetFilter(dateDatasets: Readonly<ICatalogDateDataset[]> | undefined) {
    const dispatch = useDashboardDispatch();

    const isWidgetDateDatasetAutoSelect = useDashboardSelector(selectWidgetDateDatasetAutoSelect);

    useEffect(() => {
        return () => {
            // once the config panel disappears set the auto-select flag to false so that editing existing KPIs
            // does not have it set to true
            dispatch(uiActions.setWidgetDateDatasetAutoSelect(false));
        };
    }, [dispatch]);

    const handleDateDatasetChanged = useCallback(() => {
        dispatch(uiActions.setWidgetDateDatasetAutoSelect(false));
    }, [dispatch]);

    /**
     * Only open the picker if
     * 1. auto selection happened
     * 2. there was no recommended dataset
     * 3. there are more datasets than one
     *
     * In that case we want to show the user the picker to pick one of the non-recommended datasets.
     * Otherwise the preselected recommended dataset is most likely correct so we do not bother the user
     * with the automatically opened picker.
     */
    const shouldOpenDateDatasetPicker =
        isWidgetDateDatasetAutoSelect &&
        dateDatasets &&
        dateDatasets.length > 1 &&
        !getRecommendedCatalogDateDataset(dateDatasets);

    return { handleDateDatasetChanged, shouldOpenDateDatasetPicker };
}
