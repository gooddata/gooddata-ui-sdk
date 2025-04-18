// (C) 2025 GoodData Corporation

import React from "react";
import { AutomationFilters } from "../../../../automationFilters/AutomationFilters.js";
import { FormattedMessage } from "react-intl";
import { FilterContextItem } from "@gooddata/sdk-model";

export interface IAutomationFiltersSelectProps {
    availableFilters: FilterContextItem[] | undefined;
    selectedFilters: FilterContextItem[] | undefined;
    onFiltersChange: (filters: FilterContextItem[], storeFilters?: boolean) => void;
    useFilters: boolean;
    onUseFiltersChange: (value: boolean, filters: FilterContextItem[]) => void;
    isDashboardAutomation?: boolean;
    areFiltersMissing?: boolean;
}

export const AutomationFiltersSelect: React.FC<IAutomationFiltersSelectProps> = ({
    availableFilters = [],
    selectedFilters = [],
    onFiltersChange,
    isDashboardAutomation,
    useFilters,
    onUseFiltersChange,
    areFiltersMissing,
}) => {
    const numberOfSelectedFilters = selectedFilters.length;
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
                availableFilters={availableFilters}
                selectedFilters={selectedFilters}
                onFiltersChange={onFiltersChange}
                useFilters={useFilters}
                onUseFiltersChange={onUseFiltersChange}
                isDashboardAutomation={isDashboardAutomation}
                areFiltersMissing={areFiltersMissing}
            />
        </div>
    );
};
