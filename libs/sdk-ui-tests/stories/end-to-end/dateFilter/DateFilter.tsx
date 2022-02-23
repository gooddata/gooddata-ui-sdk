// (C) 2020 GoodData Corporation
import { DateFilterGranularity } from "@gooddata/sdk-backend-spi";
import { DateFilter, defaultDateFilterOptions, DateFilterOption } from "@gooddata/sdk-ui-filters";
import { storiesOf } from "../../_infra/storyRepository";
import React, { useState } from "react";
import { StoriesForEndToEndTests } from "../../_infra/storyGroups";

const availableGranularities: DateFilterGranularity[] = [
    "GDC.time.date",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

interface IDateFilterE2EState {
    selectedFilterOption: DateFilterOption;
    excludeCurrentPeriod: boolean;
}

const DateFilterE2E: React.FC = () => {
    const [state, setState] = useState<IDateFilterE2EState>({
        selectedFilterOption: defaultDateFilterOptions.allTime!,
        excludeCurrentPeriod: false,
    });

    const onApply = (selectedFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => {
        setState({
            selectedFilterOption,
            excludeCurrentPeriod,
        });
    };

    return (
        <div className="s-date-filter">
            <DateFilter
                excludeCurrentPeriod={state.excludeCurrentPeriod}
                selectedFilterOption={state.selectedFilterOption}
                filterOptions={defaultDateFilterOptions}
                availableGranularities={availableGranularities}
                customFilterName="Selected date"
                dateFilterMode="active"
                onApply={onApply}
            />
        </div>
    );
};

storiesOf(`${StoriesForEndToEndTests}/Date Filter`).add("date filter", () => <DateFilterE2E />);
