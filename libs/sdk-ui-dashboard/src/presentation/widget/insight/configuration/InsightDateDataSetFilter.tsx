// (C) 2007-2022 GoodData Corporation
import React, { useCallback, useEffect } from "react";
import { DateDatasetFilter } from "../../common";
import { IInsightWidget, isInsightWidget, widgetRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import {
    MeasureDateDatasets,
    queryDateDatasetsForInsight,
    QueryInsightDateDatasets,
    selectInsightByRef,
    selectIsWidgetLoadingAdditionalDataByWidgetRef,
    selectWidgetDateDatasetAutoSelect,
    uiActions,
    useDashboardDispatch,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../model";
import { getRecommendedCatalogDateDataset } from "../../../../_staging/dateDatasets/getRecommendedCatalogDateDataset";

export interface IConfigurationPanelProps {
    widget: IInsightWidget;
}

export default function InsightDateDataSetFilter({ widget }: IConfigurationPanelProps) {
    const {
        status,
        run: queryDateDatasets,
        result,
    } = useDashboardQueryProcessing<
        QueryInsightDateDatasets,
        MeasureDateDatasets,
        Parameters<typeof queryDateDatasetsForInsight>
    >({
        queryCreator: queryDateDatasetsForInsight,
    });

    const dispatch = useDashboardDispatch();

    const isWidgetDateDatasetAutoSelect = useDashboardSelector(selectWidgetDateDatasetAutoSelect);
    const isLoadingAdditionalData = useDashboardSelector(
        selectIsWidgetLoadingAdditionalDataByWidgetRef(widgetRef(widget)),
    );

    const insight = useDashboardSelector(selectInsightByRef(widget.insight));
    invariant(insight, "inconsistent state in InsightDateDataSetFilter");

    const handleDateDatasetChanged = useCallback(() => {
        dispatch(uiActions.setWidgetDateDatasetAutoSelect(false));
    }, [dispatch]);

    useEffect(() => {
        // use the whole insight to improve cache hits: other calls to this query also use whole insights
        queryDateDatasets(insight);
    }, [queryDateDatasets, insight]);

    useEffect(() => {
        return () => {
            // once the config panel disappears set the auto-select flag to false so that editing existing KPIs
            // does not have it set to true
            dispatch(uiActions.setWidgetDateDatasetAutoSelect(false));
        };
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
        isWidgetDateDatasetAutoSelect &&
        result?.dateDatasets &&
        !getRecommendedCatalogDateDataset(result.dateDatasets);

    if (isInsightWidget(widget)) {
        return (
            <DateDatasetFilter
                widget={widget}
                dateFilterCheckboxDisabled={false}
                isDatasetsLoading={status === "running" || status === "pending" || isLoadingAdditionalData}
                relatedDateDatasets={result?.dateDatasetsOrdered}
                isLoadingAdditionalData={isLoadingAdditionalData}
                shouldOpenDateDatasetPicker={shouldOpenDateDatasetPicker}
                onDateDatasetChanged={handleDateDatasetChanged}
            />
        );
    }

    return null;
}
