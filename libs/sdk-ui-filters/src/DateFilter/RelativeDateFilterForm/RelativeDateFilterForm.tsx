// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IUiRelativeDateFilterForm, DateFilterOption } from "../interfaces/index.js";
import { GranularityTabs } from "./GranularityTabs.js";
import { RelativeRangePicker } from "../RelativeRangePicker/RelativeRangePicker.js";
import { DateFilterGranularity } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IRelativeDateFilterFormProps {
    availableGranularities: DateFilterGranularity[];
    selectedFilterOption: IUiRelativeDateFilterForm;
    onSelectedFilterOptionChange: (dateFilterOption: DateFilterOption) => void;
    isMobile: boolean;
}

/**
 * @internal
 */
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
            onSelectedGranularityChange={(granularity) =>
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
