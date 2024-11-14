// (C) 2022-2024 GoodData Corporation
import { IAutomationMetadataObject, IInsight } from "@gooddata/sdk-model";
import { useFiltersForWidgetScheduledExport } from "./useFiltersForWidgetScheduledExport.js";
import { useFiltersForDashboardScheduledExport } from "./useFiltersForDashboardScheduledExport.js";
import { FilterableDashboardWidget } from "../../../model/types/layoutTypes.js";

/**
 * @alpha
 */
export interface IUseDashboardScheduledEmailsFiltersProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    widget?: FilterableDashboardWidget;
    insight?: IInsight;
}

/**
 * @alpha
 */
export const useDashboardScheduledEmailsFilters = ({
    scheduledExportToEdit,
    widget,
    insight,
}: IUseDashboardScheduledEmailsFiltersProps) => {
    const {
        result: widgetFilters,
        error: widgetFiltersError,
        status,
    } = useFiltersForWidgetScheduledExport({ scheduledExportToEdit, widget, insight });

    const dashboardFilters = useFiltersForDashboardScheduledExport({ scheduledExportToEdit });

    const widgetFiltersLoading = widget ? status === "pending" || status === "running" : false;

    return {
        widgetFilters,
        widgetFiltersLoading,
        widgetFiltersError,
        dashboardFilters,
    };
};
