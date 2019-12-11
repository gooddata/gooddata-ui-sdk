// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";
import { GranularityTabs } from "./GranularityTabs";
import { RelativeRangePicker } from "../RelativeRangePicker/RelativeRangePicker";

export interface IRelativeDateFilterFormProps {
    availableGranularities: ExtendedDateFilters.DateFilterGranularity[];
    selectedFilterOption: ExtendedDateFilters.IRelativeDateFilterForm;
    onSelectedFilterOptionChange: (dateFilterOption: ExtendedDateFilters.DateFilterOption) => void;
    isMobile: boolean;
}

export const RelativeDateFilterForm: React.FC<IRelativeDateFilterFormProps> = ({
    selectedFilterOption,
    availableGranularities,
    onSelectedFilterOptionChange,
    isMobile,
}) => (
    <>
        <GranularityTabs
            availableGranularities={availableGranularities}
            selectedGranularity={selectedFilterOption.granularity}
            // tslint:disable-next-line: jsx-no-lambda
            onSelectedGranularityChange={granularity =>
                onSelectedFilterOptionChange({
                    ...selectedFilterOption,
                    ...(selectedFilterOption.granularity !== granularity && {
                        from: undefined,
                        to: undefined,
                    }),
                    granularity,
                })
            }
        />
        <RelativeRangePicker
            selectedFilterOption={selectedFilterOption}
            onSelectedFilterOptionChange={onSelectedFilterOptionChange}
            // Do not reuse components across different tabs, caused problems with focus/blur handling.
            key={selectedFilterOption.granularity}
            isMobile={isMobile}
        />
    </>
);
