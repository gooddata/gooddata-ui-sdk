// (C) 2023 GoodData Corporation

import { AttributeFilterState } from "../store/state.js";

/**
 * Type for a function that selects part of the Attribute Filter state.
 */
export type FilterSelector<TResult> = (state: AttributeFilterState) => TResult;
