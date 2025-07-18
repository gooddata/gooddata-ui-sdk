// (C) 2007-2025 GoodData Corporation
import { forwardRef, KeyboardEvent } from "react";
import { IUiRelativeDateFilterForm, DateFilterOption } from "../interfaces/index.js";
import { GranularityTabs } from "./GranularityTabs.js";
import { RelativeRangePicker } from "../RelativeRangePicker/RelativeRangePicker.js";
import { DateFilterGranularity } from "@gooddata/sdk-model";

import { DATE_FILTER_RELATIVE_GRANULARITY_TAB_ID } from "../accessibility/elementId.js";

/**
 * @internal
 */
export interface IRelativeDateFilterFormProps {
    relativeDateFilterId?: string;
    availableGranularities: DateFilterGranularity[];
    selectedFilterOption: IUiRelativeDateFilterForm;
    onSelectedFilterOptionChange: (dateFilterOption: DateFilterOption) => void;
    isMobile: boolean;
    onKeyDown?: (event: KeyboardEvent) => void;
}

/**
 * @internal
 */
export const RelativeDateFilterForm = forwardRef<HTMLDivElement, IRelativeDateFilterFormProps>(
    (
        {
            relativeDateFilterId,
            selectedFilterOption,
            availableGranularities,
            onSelectedFilterOptionChange,
            isMobile,
            onKeyDown,
        },
        ref,
    ) => {
        return (
            <>
                <div ref={ref}>
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
                        accessibilityConfig={{
                            ariaControls: relativeDateFilterId,
                        }}
                    />
                </div>
                <div onKeyDown={onKeyDown}>
                    <RelativeRangePicker
                        selectedFilterOption={selectedFilterOption}
                        onSelectedFilterOptionChange={onSelectedFilterOptionChange}
                        // Do not reuse components across different tabs, caused problems with focus/blur handling.
                        key={selectedFilterOption.granularity}
                        isMobile={isMobile}
                        accessibilityConfig={{
                            ariaLabelledBy: DATE_FILTER_RELATIVE_GRANULARITY_TAB_ID,
                            role: "tabpanel",
                        }}
                        id={relativeDateFilterId}
                    />
                </div>
            </>
        );
    },
);

RelativeDateFilterForm.displayName = "RelativeDateFilterForm";
