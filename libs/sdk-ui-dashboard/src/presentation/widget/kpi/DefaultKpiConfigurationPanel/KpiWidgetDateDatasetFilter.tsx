// (C) 2022 GoodData Corporation
import React, { useCallback, useEffect } from "react";
import { IKpiWidget, widgetRef } from "@gooddata/sdk-model";

import { DateDatasetFilter } from "../../common";
import {
    enableKpiWidgetDateFilter,
    MeasureDateDatasets,
    queryDateDatasetsForMeasure,
    QueryMeasureDateDatasets,
    selectIsWidgetLoadingAdditionalDataByWidgetRef,
    selectKpiDateDatasetAutoSelect,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../model";
import { getRecommendedCatalogDateDataset } from "../../../../_staging/dateDatasets/getRecommendedCatalogDateDataset";

export const KpiWidgetDateDatasetFilter: React.FC<{
    widget: IKpiWidget;
}> = (props) => {
    const { widget } = props;
    const ref = widgetRef(widget);

    const {
        status,
        run: queryDateDatasets,
        result,
    } = useDashboardQueryProcessing<
        QueryMeasureDateDatasets,
        MeasureDateDatasets,
        Parameters<typeof queryDateDatasetsForMeasure>
    >({
        queryCreator: queryDateDatasetsForMeasure,
    });

    useEffect(() => {
        queryDateDatasets(widget.kpi.metric);
    }, [queryDateDatasets, widget.kpi.metric]);

    const isKpiDateDatasetAutoSelect = useDashboardSelector(selectKpiDateDatasetAutoSelect);
    const isLoadingAdditionalData = useDashboardSelector(selectIsWidgetLoadingAdditionalDataByWidgetRef(ref));

    const dispatch = useDashboardDispatch();
    const { run: preselectDateDataset } = useDashboardCommandProcessing({
        commandCreator: enableKpiWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onError: () => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(ref));
            dispatch(uiActions.setKpiDateDatasetAutoSelect(false));
        },
        onSuccess: () => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(ref));
        },
    });

    // preselect the first dataset upon loading if the auto select was true
    useEffect(() => {
        if (isKpiDateDatasetAutoSelect) {
            preselectDateDataset(ref, "default");
        }
    }, [isKpiDateDatasetAutoSelect, dispatch, ref, preselectDateDataset]);

    const handleDateDatasetChanged = useCallback(() => {
        dispatch(uiActions.setKpiDateDatasetAutoSelect(false));
    }, [dispatch]);

    /**
     * Only open the picker if
     * 1. auto selection happened
     * 2. there was no recommended dataset
     *
     * In that case we want to show the user the picker to pick one of the non-recommended datasets.
     * Otherwise the preselected recommended dataset is most likely correct so we do not bother the user
     * with the automatically opened picker.
     */
    const shouldOpenDateDatasetPicker =
        isKpiDateDatasetAutoSelect &&
        result?.dateDatasets &&
        !getRecommendedCatalogDateDataset(result.dateDatasets);

    useEffect(() => {
        return () => {
            // once the config panel disappears set the auto-select flag to false so that editing existing KPIs
            // does not have it set to true
            dispatch(uiActions.setKpiDateDatasetAutoSelect(false));
        };
    }, [dispatch]);

    return (
        <div className="gd-kpi-date-dataset-dropdown">
            <DateDatasetFilter
                widget={widget}
                dateFilterCheckboxDisabled={false} // for KPI date checkbox is always enabled
                isDatasetsLoading={status === "running" || status === "pending" || isLoadingAdditionalData}
                relatedDateDatasets={result?.dateDatasetsOrdered}
                shouldPickDateDataset={isKpiDateDatasetAutoSelect}
                shouldOpenDateDatasetPicker={shouldOpenDateDatasetPicker}
                isLoadingAdditionalData={isLoadingAdditionalData}
                onDateDatasetChanged={handleDateDatasetChanged}
            />
        </div>
    );
};
