// (C) 2007-2026 GoodData Corporation

import { useEffect } from "react";

import { invariant } from "ts-invariant";

import { type IInsightWidget, widgetRef } from "@gooddata/sdk-model";

import {
    type IMeasureDateDatasets,
    type IQueryInsightDateDatasets,
    queryDateDatasetsForInsight,
    selectInsightByRef,
    selectIsWidgetLoadingAdditionalDataByWidgetRef,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDateDatasetFilter } from "../../common/configuration/useDateDatasetFilter.js";
import { DateDatasetFilter } from "../../common/index.js";

export interface IConfigurationPanelProps {
    widget: IInsightWidget;
}

export function InsightDateDataSetFilter({ widget }: IConfigurationPanelProps) {
    const {
        status,
        run: queryDateDatasets,
        result,
    } = useDashboardQueryProcessing<
        IQueryInsightDateDatasets,
        IMeasureDateDatasets,
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
