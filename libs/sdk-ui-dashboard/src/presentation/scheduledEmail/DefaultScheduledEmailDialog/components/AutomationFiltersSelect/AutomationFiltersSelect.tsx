// (C) 2025 GoodData Corporation

import React from "react";
import { AutomationFilters } from "../../../../automationFilters/AutomationFilters.js";
import { useAutomationFilters } from "../../../../automationFilters/useAutomationFilters.js";
import { FormattedMessage } from "react-intl";
import { FilterContextItem } from "@gooddata/sdk-model";

export interface IAutomationFiltersSelectProps {
    availableFilters: FilterContextItem[] | undefined;
    selectedFilters: FilterContextItem[] | undefined;
    onFiltersChange: (filters: FilterContextItem[]) => void;
    storeFilters: boolean;
    onStoreFiltersChange: (value: boolean, filters: FilterContextItem[]) => void;
    isDashboardAutomation?: boolean;
    areFiltersMissing?: boolean;
}

export const AutomationFiltersSelect: React.FC<IAutomationFiltersSelectProps> = ({
    availableFilters = [],
    selectedFilters = [],
    onFiltersChange,
    isDashboardAutomation,
    storeFilters,
    onStoreFiltersChange,
    areFiltersMissing,
}) => {
    const {
        visibleFilters,
        attributes,
        dateDatasets,
        attributeConfigs,
        dateConfigs,
        handleAddFilter,
        handleDeleteFilter,
        handleChangeFilter,
        handleStoreFiltersChange,
    } = useAutomationFilters({
        availableFilters,
        selectedFilters,
        onFiltersChange,
        onStoreFiltersChange,
    });

    const numberOfSelectedFilters = visibleFilters.length;
    const accessibilityValue = "schedule.filters";

    return (
        <div className="gd-input-component gd-notification-channels-automation-filters s-gd-notifications-channels-dialog-automation-filters">
            <label htmlFor={accessibilityValue} className="gd-label">
                <FormattedMessage
                    id="dialogs.schedule.email.filters"
                    values={{ count: numberOfSelectedFilters }}
                />
            </label>
            <AutomationFilters
                id={accessibilityValue}
                filters={visibleFilters}
                attributes={attributes}
                dateDatasets={dateDatasets}
                attributeConfigs={attributeConfigs}
                dateConfigs={dateConfigs}
                handleAddFilter={handleAddFilter}
                handleDeleteFilter={handleDeleteFilter}
                handleChangeFilter={handleChangeFilter}
                storeFilters={storeFilters}
                handleStoreFiltersChange={handleStoreFiltersChange}
                isDashboardAutomation={isDashboardAutomation}
                areFiltersMissing={areFiltersMissing}
            />
        </div>
    );
};
