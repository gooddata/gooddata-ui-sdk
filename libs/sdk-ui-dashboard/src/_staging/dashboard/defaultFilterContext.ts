// (C) 2021-2022 GoodData Corporation
import {
    IDateFilterConfig,
    isAllTimeDateFilterOption,
    isAbsoluteDateFilterPreset,
    isRelativeDateFilterPreset,
    IDashboardDateFilter,
    IFilterContextDefinition,
} from "@gooddata/sdk-model";
import { convertDateFilterConfigToDateFilterOptions } from "../dateFilterConfig/dateFilterConfigConverters.js";
import { flattenDateFilterOptions } from "../dateFilterConfig/dateFilterOptionMapping.js";
import { DateFilterOption } from "@gooddata/sdk-ui-filters";
import { convertOptionToDateFilter } from "../dateFilterConfig/dateFilterOptionConverters.js";

/**
 * Returns the date filter option that should be used for new dashboards (respecting the selectedOption configuration).
 *
 * @remarks
 * If the date filter option defined by selectedOption value cannot be used (or the value is not specified)
 * or this is disabled by the second parameter, the function falls back to the first visible date filter option.
 *
 * @param dateFilterConfig - configuration to use
 * @param respectSelectedOption - whether to try to use the item in the selectedOption configuration
 * @returns undefined if no usable filter is found
 */
function getDefaultDateFilterOption(
    dateFilterConfig: IDateFilterConfig,
    respectSelectedOption: boolean,
): DateFilterOption | undefined {
    const { selectedOption: candidateOptionId } = dateFilterConfig;
    const dateFilterOptions = convertDateFilterConfigToDateFilterOptions(dateFilterConfig);
    const flattenedOptions = flattenDateFilterOptions(dateFilterOptions);

    if (respectSelectedOption) {
        const candidateOption = flattenedOptions.find(
            (option) => option.localIdentifier === candidateOptionId,
        );

        if (candidateOption) {
            // only presets and all time are allowed for now (RAIL-1598)
            const canCandidateFilterBeSelected =
                candidateOption.visible &&
                (isAllTimeDateFilterOption(candidateOption) ||
                    isAbsoluteDateFilterPreset(candidateOption) ||
                    isRelativeDateFilterPreset(candidateOption));

            if (canCandidateFilterBeSelected) {
                return candidateOption;
            }
        }
    }

    return flattenedOptions.find((option) => option.visible);
}

function getDefaultDateFilter(
    dateFilterConfig: IDateFilterConfig,
    respectSelectedOption: boolean,
): IDashboardDateFilter | undefined {
    const defaultFilterOption = getDefaultDateFilterOption(dateFilterConfig, respectSelectedOption);

    if (!defaultFilterOption) {
        return;
    }

    return convertOptionToDateFilter(defaultFilterOption);
}

export function createDefaultFilterContext(
    dateFilterConfig: IDateFilterConfig,
    /**
     * TODO: we should probably get to a state where this parameter is not needed and the selectedOption
     * is always respected (for both new and existing dashboards without filterContext).
     * Done like this for now because it is the way gdc-dashboards behave.
     */
    respectSelectedOption: boolean = true,
): IFilterContextDefinition {
    const defaultDateFilter = getDefaultDateFilter(dateFilterConfig, respectSelectedOption);

    return {
        title: "filterContext",
        description: "",
        filters: defaultDateFilter ? [defaultDateFilter] : [],
    };
}
