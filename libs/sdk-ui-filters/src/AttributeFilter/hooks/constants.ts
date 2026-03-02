// (C) 2022-2026 GoodData Corporation

import { type Correlation } from "../../AttributeFilterHandler/types/common.js";

/**
 * @internal
 */
export const SEARCH_CORRELATION: Correlation = "search";

/**
 * @internal
 */
export const RESET_CORRELATION: Correlation = "reset";

/**
 * @internal
 */
export const PARENT_FILTERS_CORRELATION: Correlation = "parentFilters";

/**
 * @internal
 */
export const SHOW_FILTERED_ELEMENTS_CORRELATION: Correlation = "showFilteredElements";

/**
 * @internal
 */
export const IRRELEVANT_SELECTION: Correlation = "irrelevantSelection";

/**
 * @internal
 */
export const DISPLAY_FORM_CHANGED_CORRELATION: Correlation = "displayFormChanged";

/**
 * @internal
 */
export const MAX_SELECTION_SIZE = 500;

/**
 * @internal
 * Backend max page size for fetching attribute elements.
 * FE will never get total count higher than this value.
 * If the total items count is equal to the BE page size,
 * the selection size will not be displayed.
 */
export const BACKEND_PAGE_SIZE = 10000;
