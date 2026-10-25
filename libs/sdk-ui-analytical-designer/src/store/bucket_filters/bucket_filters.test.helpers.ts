// (C) 2021-2026 GoodData Corporation

import { FilterBarService } from "../filter_bar/filter_bar_service.js";
import { type IFilter } from "../filter_bar/filter_bar_types.js";
import { type IAppState } from "../types.js";

export function addGlobalDateFilter(state: IAppState, globalDateFilter: IFilter) {
    return FilterBarService.setFilterBarState(state, {
        attributeFilterConfigs: {},
        items: [globalDateFilter],
        parameterItems: [],
        isMultiline: false,
        migratedAdditionalFilters: [],
        filterBarDropdownOpen: false,
    });
}
