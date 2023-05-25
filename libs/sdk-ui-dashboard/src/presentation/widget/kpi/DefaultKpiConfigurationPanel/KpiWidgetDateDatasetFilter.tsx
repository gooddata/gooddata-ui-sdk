// (C) 2022-2023 GoodData Corporation
import React, { useEffect } from "react";
import { IKpiWidget, widgetRef } from "@gooddata/sdk-model";

import { DateDatasetFilter } from "../../common/index.js";
import {
    enableKpiWidgetDateFilter,
    MeasureDateDatasets,
    queryDateDatasetsForMeasure,
    QueryMeasureDateDatasets,
    selectIsWidgetLoadingAdditionalDataByWidgetRef,
    selectWidgetDateDatasetAutoSelect,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDateDatasetFilter } from "../../common/configuration/useDateDatasetFilter.js";
import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef.js";

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

    const isWidgetDateDatasetAutoSelect = useDashboardSelector(selectWidgetDateDatasetAutoSelect);
    const isLoadingAdditionalData = useDashboardSelector(selectIsWidgetLoadingAdditionalDataByWidgetRef(ref));

    const dispatch = useDashboardDispatch();
    const { run: preselectDateDataset } = useDashboardCommandProcessing({
        commandCreator: enableKpiWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onError: () => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(ref));
            dispatch(uiActions.setWidgetDateDatasetAutoSelect(false));
        },
        onSuccess: () => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(ref));
        },
    });

    // preselect the first dataset upon loading if the auto select was true
    useEffect(() => {
        if (isWidgetDateDatasetAutoSelect) {
            preselectDateDataset(ref, "default");
        }
        // We need to safely serialize ref here to avoid recalling the effect
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWidgetDateDatasetAutoSelect, safeSerializeObjRef(ref), preselectDateDataset]);

    const { handleDateDatasetChanged, shouldOpenDateDatasetPicker } = useDateDatasetFilter(
        result?.dateDatasets,
    );

    return (
        <div className="gd-kpi-date-dataset-dropdown">
            <DateDatasetFilter
                widget={widget}
                dateFilterCheckboxDisabled={false} // for KPI date checkbox is always enabled
                isDatasetsLoading={status === "running" || status === "pending" || isLoadingAdditionalData}
                relatedDateDatasets={result?.dateDatasetsOrdered}
                shouldPickDateDataset={isWidgetDateDatasetAutoSelect}
                shouldOpenDateDatasetPicker={shouldOpenDateDatasetPicker}
                isLoadingAdditionalData={isLoadingAdditionalData}
                onDateDatasetChanged={handleDateDatasetChanged}
            />
        </div>
    );
};
