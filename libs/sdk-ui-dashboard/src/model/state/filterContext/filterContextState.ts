// (C) 2021 GoodData Corporation

import { IFilterContext } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface FilterContextState {
    filterContext?: IFilterContext;
}

export const filterContextInitialState: FilterContextState = { filterContext: undefined };
