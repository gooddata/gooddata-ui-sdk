// (C) 2021 GoodData Corporation

import { IFilterContextDefinition } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface FilterContextState {
    filterContext?: IFilterContextDefinition;
}

export const filterContextInitialState: FilterContextState = { filterContext: undefined };
