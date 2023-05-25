// (C) 2007-2023 GoodData Corporation
import React, { useEffect, useMemo } from "react";
import { DateDatasetFilter } from "../../common/index.js";
import {
    IInsightWidget,
    IMeasure,
    insightMeasures,
    isDateFilter,
    isSimpleMeasure,
    measureFilters,
    widgetRef,
} from "@gooddata/sdk-model";
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
import isEmpty from "lodash/isEmpty.js";

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

    const dateOptionsDisabled = useMemo(() => {
        const measures = insightMeasures(insight);
        return isEmpty(measures) ? false : measures.every(isDateFiltered);
    }, [insight]);

    return (
        <DateDatasetFilter
            widget={widget}
            dateFilterCheckboxDisabled={dateOptionsDisabled}
            isDatasetsLoading={status === "running" || status === "pending" || isLoadingAdditionalData}
            relatedDateDatasets={result?.dateDatasetsOrdered}
            isLoadingAdditionalData={isLoadingAdditionalData}
            shouldOpenDateDatasetPicker={shouldOpenDateDatasetPicker}
            onDateDatasetChanged={handleDateDatasetChanged}
        />
    );
}

function isDateFiltered(measure: IMeasure) {
    if (isSimpleMeasure(measure)) {
        const filters = measureFilters(measure) ?? [];
        return filters.some(isDateFilter);
    }
    return true;
}
