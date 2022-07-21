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
import React from "react";
import { useInsightWidgetRelatedDateDatasets } from "../../../widget/common/useWidgetRelatedDateDatasets";
import { IInsightWidget, isInsightWidget } from "@gooddata/sdk-model";
import { DateDatasetFilter } from "../../common/configuration/DateDatasetFilter";

export interface IConfigurationPanelProps {
    widget: IInsightWidget;
}

export default function InsightDateDataSetFilter({ widget }: IConfigurationPanelProps) {
    const { status, result } = useInsightWidgetRelatedDateDatasets(widget);

    if (isInsightWidget(widget)) {
        return (
            <DateDatasetFilter
                widget={widget}
                dateFilterCheckboxDisabled={false}
                isDatasetsLoading={status === "loading" || status === "pending"}
                relatedDateDatasets={result}
            />
        );
    }

    return null;
}
