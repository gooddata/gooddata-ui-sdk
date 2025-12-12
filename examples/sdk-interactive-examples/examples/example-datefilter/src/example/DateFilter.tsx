// (C) 2021-2025 GoodData Corporation

import { type DateFilterGranularity } from "@gooddata/sdk-model";
import { DateFilter, type DateFilterOption, defaultDateFilterOptions } from "@gooddata/sdk-ui-filters";

import { type IDateFilterComponentExampleState } from "./Example.js";

const availableGranularities: DateFilterGranularity[] = [
    "GDC.time.date",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

export interface IFilterComponentProps {
    filter: IDateFilterComponentExampleState;
    setFilter: (filter: IDateFilterComponentExampleState) => void;
}

export function Filter({ filter, setFilter }: IFilterComponentProps) {
    const { excludeCurrentPeriod, selectedFilterOption } = filter;
    const onApply = (selectedFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => {
        setFilter({
            selectedFilterOption,
            excludeCurrentPeriod,
        });
    };

    return (
        <div style={{ width: 300, margin: "auto" }}>
            <DateFilter
                excludeCurrentPeriod={excludeCurrentPeriod}
                selectedFilterOption={selectedFilterOption}
                filterOptions={defaultDateFilterOptions}
                availableGranularities={availableGranularities}
                customFilterName="Date Filter"
                dateFilterMode="active"
                onApply={onApply}
            />
        </div>
    );
}
