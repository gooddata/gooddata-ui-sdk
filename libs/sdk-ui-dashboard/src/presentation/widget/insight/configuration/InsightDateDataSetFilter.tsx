// (C) 2007-2022 GoodData Corporation
// import { connect } from "react-redux";
// import { getRecommendedDateDataset } from "@gooddata/sdk-ui-kit";
//
// import DateDataSetFilter, {
//     IDateDataSetFilterDispatchProps,
//     IDateDataSetFilterStateProps,
// } from "../common/DateDataSetFilter";
// import { getSelectedWidgetRef } from "../../modules/Core/services/DashboardService";
// import { autoOpenChanged } from "../../modules/Core/actions/VisualizationActions";
// import { dateDataSetFilterEnabled, dateDataSetSelected } from "../../modules/Core/actions/EditModeActions";
// import {
//     areDateDataSetsLoading,
//     getRelatedDateDataSets,
//     getSelectedDateDataSet,
// } from "../../modules/VisualizationsCache";
// import { AppState } from "../../modules/Core/typings/state";
// import { IProcessedDateDataset } from "../../modules/Core/typings/DateDataSets";
// import {
//     getDateFilterCheckboxDisabled,
//     getWidgetByRef,
//     getWidgetType,
//     getDateFilterEnabled,
//     getDateFilterLoading,
//     getDateFilterAutoOpen,
//     getVisualizationDateDataSet,
// } from "../../modules/Widgets";
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
