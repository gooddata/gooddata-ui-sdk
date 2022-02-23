// (C) 2021 GoodData Corporation

import React, { useState } from "react";
import { DateFilter, DateFilterOption } from "@gooddata/sdk-ui-filters";
import { availableGranularities, defaultDateFilterOptions } from "../../constants/dateFilterConstants";

interface IDateFilterScenarioState {
    selectedFilterOption: DateFilterOption;
    excludeCurrentPeriod: boolean;
}
export const DateFilterScenario: React.FC = () => {
    const [state, setState] = useState<IDateFilterScenarioState>({
        excludeCurrentPeriod: false,
        selectedFilterOption: defaultDateFilterOptions.allTime!,
    });

    function onApply(selectedFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) {
        setState({
            selectedFilterOption,
            excludeCurrentPeriod,
        });
    }

    return (
        <DateFilter
            excludeCurrentPeriod={state.excludeCurrentPeriod}
            selectedFilterOption={state.selectedFilterOption}
            filterOptions={defaultDateFilterOptions}
            availableGranularities={availableGranularities}
            customFilterName="Selected date"
            dateFilterMode="active"
            dateFormat="MM/dd/yyyy"
            onApply={onApply}
        />
    );
};
