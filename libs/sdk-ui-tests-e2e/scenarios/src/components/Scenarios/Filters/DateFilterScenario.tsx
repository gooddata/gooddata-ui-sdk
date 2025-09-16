// (C) 2021-2025 GoodData Corporation

import { useState } from "react";

import { DateFilter, DateFilterOption } from "@gooddata/sdk-ui-filters";

import { availableGranularities, defaultDateFilterOptions } from "../../constants/dateFilterConstants";

interface IDateFilterScenarioState {
    selectedFilterOption: DateFilterOption;
    excludeCurrentPeriod: boolean;
    isTimeEnabled: boolean;
}
export function DateFilterScenario() {
    const [state, setState] = useState<IDateFilterScenarioState>({
        excludeCurrentPeriod: false,
        selectedFilterOption: defaultDateFilterOptions.allTime!,
        isTimeEnabled: false,
    });

    function onApply(selectedFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) {
        setState((state) => ({
            ...state,
            selectedFilterOption,
            excludeCurrentPeriod,
        }));
    }

    function setIsTimeEnabled(isTimeEnabled: boolean) {
        setState((state) => ({
            ...state,
            isTimeEnabled,
        }));
    }

    return (
        <>
            <DateFilter
                excludeCurrentPeriod={state.excludeCurrentPeriod}
                selectedFilterOption={state.selectedFilterOption}
                filterOptions={defaultDateFilterOptions}
                availableGranularities={availableGranularities}
                customFilterName="Selected date"
                dateFilterMode="active"
                dateFormat="MM/dd/yyyy"
                onApply={onApply}
                isTimeForAbsoluteRangeEnabled={state.isTimeEnabled}
            />
            <a
                href="#"
                className="time-switcher"
                onClick={() => {
                    setIsTimeEnabled(!state.isTimeEnabled);
                }}
            >
                {state.isTimeEnabled ? "disable" : "enable"} time
            </a>
        </>
    );
}
