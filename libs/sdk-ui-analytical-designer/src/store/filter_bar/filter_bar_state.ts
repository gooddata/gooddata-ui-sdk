// (C) 2026 GoodData Corporation

import { type IAttributeFilterConfigs } from "@gooddata/sdk-model";

import { type IFilter } from "./filter_bar_types.js";
import { type IParameterFilter } from "./parameter_filter_types.js";

export interface IFilterBarState {
    readonly items: ReadonlyArray<IFilter>;
    readonly parameterItems: ReadonlyArray<IParameterFilter>;
    readonly isMultiline: boolean;
    /**
     * Local identifiers of the additional date filters the last date dimension change REMOVED along
     * with a real selection (the new dataset lacked their granularity); the date filter warns about
     * them until the user edits the additional filters in any way or the picker closes.
     */
    readonly migratedAdditionalFilters: string[];
    readonly filterBarDropdownOpen: boolean;
    readonly attributeFilterConfigs: IAttributeFilterConfigs;
}

export const defaultFilterBarState: IFilterBarState = {
    items: [],
    parameterItems: [],
    isMultiline: false,
    migratedAdditionalFilters: [],
    filterBarDropdownOpen: false,
    attributeFilterConfigs: {},
};
