// (C) 2021 GoodData Corporation

import { IFilterContextDefinition } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export interface FilterContextState {
    filterContext?: IFilterContextDefinition;
}

export const filterContextInitialState: FilterContextState = { filterContext: undefined };
