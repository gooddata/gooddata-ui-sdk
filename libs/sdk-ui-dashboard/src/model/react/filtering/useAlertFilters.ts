// (C) 2022-2025 GoodData Corporation
import { IAutomationMetadataObject, IInsight } from "@gooddata/sdk-model";
import { useWidgetAlertFilters } from "./useWidgetAlertFilters.js";
import { FilterableDashboardWidget } from "../../types/layoutTypes.js";

/**
 * @alpha
 */
export interface IUseAlertFiltersProps {
    alertToEdit?: IAutomationMetadataObject;
    widget?: FilterableDashboardWidget;
    insight?: IInsight;
}

/**
 * Hook for getting filters for widget alert.
 *
 * If alertToEdit is provided, it returns its saved filters as is.
 * If alertToEdit is not provided, it returns sanitized filters ready to be saved in new widget alert.
 *
 * @alpha
 */
export const useAlertFilters = ({ alertToEdit, widget, insight }: IUseAlertFiltersProps) => {
    const {
        result: widgetFilters,
        error: widgetFiltersError,
        status,
    } = useWidgetAlertFilters({ alertToEdit, widget, insight });

    const widgetFiltersLoading = widget ? status === "pending" || status === "running" : false;

    return {
        widgetFilters,
        widgetFiltersLoading,
        widgetFiltersError,
    };
};
