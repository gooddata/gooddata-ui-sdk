// (C) 2007-2022 GoodData Corporation
import React, { useEffect } from "react";
import { DateDatasetFilter } from "../../common";
import { IInsightWidget, isInsightWidget, widgetRef } from "@gooddata/sdk-model";
import {
    MeasureDateDatasets,
    queryDateDatasetsForInsight,
    QueryInsightDateDatasets,
    selectIsWidgetLoadingAdditionalDataByWidgetRef,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../model";

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

    useEffect(() => {
        queryDateDatasets(widget.insight);
    }, [queryDateDatasets, widget.insight]);

    if (isInsightWidget(widget)) {
        return (
            <DateDatasetFilter
                widget={widget}
                dateFilterCheckboxDisabled={false}
                isDatasetsLoading={status === "running" || status === "pending" || isLoadingAdditionalData}
                relatedDateDatasets={result?.dateDatasetsOrdered}
                isLoadingAdditionalData={isLoadingAdditionalData}
            />
        );
    }

    return null;
}
