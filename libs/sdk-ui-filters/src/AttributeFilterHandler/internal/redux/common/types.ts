// (C) 2023-2026 GoodData Corporation

import { type IAttributeFilterState } from "../store/state.js";

/**
 * Type for a function that selects part of the Attribute Filter state.
 */
export type FilterSelector<TResult> = (state: IAttributeFilterState) => TResult;
