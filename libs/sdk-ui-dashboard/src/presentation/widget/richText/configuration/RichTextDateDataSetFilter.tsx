// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import { type IRichTextWidget, widgetRef } from "@gooddata/sdk-model";

import {
    type InsightDateDatasets,
    type QueryInsightDateDatasets,
    queryDateDatasetsForInsight,
    selectIsWidgetLoadingAdditionalDataByWidgetRef,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDateDatasetFilter } from "../../common/configuration/useDateDatasetFilter.js";
import { DateDatasetFilter } from "../../common/index.js";

export interface IRichTextDateDataSetFilterProps {
    widget: IRichTextWidget;
}

export function RichTextDateDataSetFilter({ widget }: IRichTextDateDataSetFilterProps) {
    const {
        status,
        run: queryDateDatasets,
        result,
    } = useDashboardQueryProcessing<
        QueryInsightDateDatasets,
        InsightDateDatasets,
        Parameters<typeof queryDateDatasetsForInsight>
    >({
        queryCreator: queryDateDatasetsForInsight,
    });

    const isLoadingAdditionalData = useDashboardSelector(
        selectIsWidgetLoadingAdditionalDataByWidgetRef(widgetRef(widget)),
    );

    useEffect(() => {
        queryDateDatasets();
    }, [queryDateDatasets]);

    const { handleDateDatasetChanged, shouldOpenDateDatasetPicker } = useDateDatasetFilter(
        result?.dateDatasets,
    );

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
