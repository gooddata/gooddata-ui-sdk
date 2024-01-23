// (C) 2007-2024 GoodData Corporation
import React, { useEffect } from "react";
import { DateDatasetFilter } from "../../common/index.js";
import { IInsightWidget, widgetRef } from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import {
    MeasureDateDatasets,
    queryDateDatasetsForInsight,
    QueryInsightDateDatasets,
    selectInsightByRef,
    selectIsWidgetLoadingAdditionalDataByWidgetRef,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDateDatasetFilter } from "../../common/configuration/useDateDatasetFilter.js";

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

    const isLoadingAdditionalData = useDashboardSelector(
        selectIsWidgetLoadingAdditionalDataByWidgetRef(widgetRef(widget)),
    );

    const insight = useDashboardSelector(selectInsightByRef(widget.insight));
    invariant(insight, "inconsistent state in InsightDateDataSetFilter");

    useEffect(() => {
        // use the whole insight to improve cache hits: other calls to this query also use whole insights
        queryDateDatasets(insight);
    }, [queryDateDatasets, insight]);

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
