// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

import { type IRichTextWidget, widgetRef } from "@gooddata/sdk-model";

import {
    type IInsightDateDatasets,
    type IQueryInsightDateDatasets,
    queryDateDatasetsForInsight,
} from "../../../../model/queries/insights.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardQueryProcessing } from "../../../../model/react/useDashboardQueryProcessing.js";
import { selectIsWidgetLoadingAdditionalDataByWidgetRef } from "../../../../model/store/ui/uiSelectors.js";
import { DateDatasetFilter } from "../../common/configuration/DateDatasetFilter.js";
import { useDateDatasetFilter } from "../../common/configuration/useDateDatasetFilter.js";

export interface IRichTextDateDataSetFilterProps {
    widget: IRichTextWidget;
}

export function RichTextDateDataSetFilter({ widget }: IRichTextDateDataSetFilterProps) {
    const {
        status,
        run: queryDateDatasets,
        result,
    } = useDashboardQueryProcessing<
        IQueryInsightDateDatasets,
        IInsightDateDatasets,
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
