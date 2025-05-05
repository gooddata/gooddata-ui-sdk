// (C) 2022-2025 GoodData Corporation
import { IAutomationMetadataObject, IInsight } from "@gooddata/sdk-model";
import { useFiltersForWidgetAlert } from "./useFiltersForWidgetAlert.js";
import { FilterableDashboardWidget } from "../../../model/types/layoutTypes.js";
import { useFiltersForDashboardWidgetAlert } from "./useFiltersForDashboardWidgetAlert.js";

/**
 * @alpha
 */
export interface IUseDashboardAlertFiltersProps {
    alertToEdit?: IAutomationMetadataObject;
    widget?: FilterableDashboardWidget;
    insight?: IInsight;
}

/**
 * @alpha
 */
export const useDashboardAlertFilters = ({
    alertToEdit,
    widget,
    insight,
}: IUseDashboardAlertFiltersProps) => {
    const {
        result: widgetFilters,
        error: widgetFiltersError,
        status,
    } = useFiltersForWidgetAlert({ alertToEdit, widget, insight });

    const dashboardFilters = useFiltersForDashboardWidgetAlert({ alertToEdit });

    const widgetFiltersLoading = widget ? status === "pending" || status === "running" : false;

    return {
        widgetFilters,
        widgetFiltersLoading,
        widgetFiltersError,
        dashboardFilters,
    };
};
