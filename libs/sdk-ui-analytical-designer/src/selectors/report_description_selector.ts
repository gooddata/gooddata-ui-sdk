// (C) 2022-2026 GoodData Corporation

import { createSelector } from "reselect";

import { convertFilter } from "../convertors/fromBackend/VisualizationConverter.js";
import { filtersToMetadata } from "../models/metadata.js";
import {
    getAttributeFilterConfigs,
    getFilterItemsWithoutAdditionalDateAttributes,
} from "../store/filter_bar/filter_bar_selector.js";
import { getInsightSummary } from "../store/insight/insight_selectors.js";
import { type IAppState } from "../store/types.js";

import { getSeparators } from "./bootstrap_selector.js";

const getCurrentDescription = (state: IAppState): string => getInsightSummary(state);

export const reportDescriptionSelector = createSelector(
    getCurrentDescription,
    getAttributeFilterConfigs,
    getFilterItemsWithoutAdditionalDateAttributes,
    getSeparators,
    (currentDescription, attributeFilterConfigs, filterItems, separators) => {
        const extendedFilters = filtersToMetadata(filterItems, attributeFilterConfigs);

        const filters = extendedFilters.map(convertFilter);
        return {
            currentDescription,
            filters,
            separators,
        };
    },
);
