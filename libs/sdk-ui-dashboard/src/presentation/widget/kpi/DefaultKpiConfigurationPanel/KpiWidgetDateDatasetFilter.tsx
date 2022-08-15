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
    selectKpiDateDatasetAutoOpen,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../model";

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

    const isKpiDateDatasetAutoOpen = useDashboardSelector(selectKpiDateDatasetAutoOpen);
    const isLoadingAdditionalData = useDashboardSelector(selectIsWidgetLoadingAdditionalDataByWidgetRef(ref));

    const dispatch = useDashboardDispatch();
    const { run: preselectDateDataset } = useDashboardCommandProcessing({
        commandCreator: enableKpiWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onError: () => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(ref));
            dispatch(uiActions.setKpiDateDatasetAutoOpen(false));
        },
        onSuccess: () => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(ref));
        },
    });

    // preselect the first dataset upon loading if the auto open was true
    useEffect(() => {
        if (isKpiDateDatasetAutoOpen) {
            preselectDateDataset(ref, "default");
        }
    }, [isKpiDateDatasetAutoOpen, dispatch, ref, preselectDateDataset]);

    const handleDateDatasetChanged = useCallback(() => {
        dispatch(uiActions.setKpiDateDatasetAutoOpen(false));
    }, [dispatch]);

    useEffect(() => {
        return () => {
            // once the config panel disappears set the auto-open flag to false so that editing existing KPIs
            // does not have it set to true
            dispatch(uiActions.setKpiDateDatasetAutoOpen(false));
        };
    }, [dispatch]);

    return (
        <div className="gd-kpi-date-dataset-dropdown">
            <DateDatasetFilter
                widget={widget}
                dateFilterCheckboxDisabled={false} // for KPI date checkbox is always enabled
                isDatasetsLoading={status === "running" || status === "pending" || isLoadingAdditionalData}
                relatedDateDatasets={result?.dateDatasetsOrdered}
                shouldPickDateDataset={isKpiDateDatasetAutoOpen}
                isLoadingAdditionalData={isLoadingAdditionalData}
                onDateDatasetChanged={handleDateDatasetChanged}
            />
        </div>
    );
};
