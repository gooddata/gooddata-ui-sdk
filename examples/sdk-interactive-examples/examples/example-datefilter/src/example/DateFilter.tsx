// (C) 2021-2025 GoodData Corporation
import React from "react";

import { DateFilterGranularity } from "@gooddata/sdk-model";
import { DateFilter, DateFilterOption, defaultDateFilterOptions } from "@gooddata/sdk-ui-filters";

import { IDateFilterComponentExampleState } from "./Example.js";

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

function Filter(props: IFilterComponentProps) {
    const { filter, setFilter } = props;
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

export default Filter;
