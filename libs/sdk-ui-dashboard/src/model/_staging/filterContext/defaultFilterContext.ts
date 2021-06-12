// (C) 2021 GoodData Corporation
import {
    IDashboardDateFilter,
    IDateFilterConfig,
    IFilterContextDefinition,
    isAbsoluteDateFilterPreset,
    isAllTimeDateFilterOption,
    isRelativeDateFilterPreset,
} from "@gooddata/sdk-backend-spi";
import { convertDateFilterConfigToDateFilterOptions } from "../dateFilterConfig/dateFilterConfigConverters";
import { flattenDateFilterOptions } from "../dateFilterConfig/dateFilterOptionMapping";
import { DateFilterOption } from "@gooddata/sdk-ui-filters";
import { convertOptionToDateFilter } from "../dateFilterConfig/dateFilterOptionConverters";

function getDefaultDateFilterOption(dateFilterConfig: IDateFilterConfig): DateFilterOption | undefined {
    const { selectedOption: candidateOptionId } = dateFilterConfig;
    const dateFilterOptions = convertDateFilterConfigToDateFilterOptions(dateFilterConfig);
    const flattenedOptions = flattenDateFilterOptions(dateFilterOptions);
    const candidateOption = flattenedOptions.find((option) => option.localIdentifier === candidateOptionId);

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

    return flattenedOptions.find((option) => option.visible);
}

function getDefaultDateFilter(dateFilterConfig: IDateFilterConfig): IDashboardDateFilter | undefined {
    const defaultFilterOption = getDefaultDateFilterOption(dateFilterConfig);

    if (!defaultFilterOption) {
        return;
    }

    return convertOptionToDateFilter(defaultFilterOption);
}

export function createDefaultFilterContext(dateFilterConfig: IDateFilterConfig): IFilterContextDefinition {
    const defaultDateFilter = getDefaultDateFilter(dateFilterConfig);

    return {
        title: "filterContext",
        description: "",
        filters: defaultDateFilter ? [defaultDateFilter] : [],
    };
}
