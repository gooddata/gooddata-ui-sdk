// (C) 2007-2019 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { IMappingHeader } from "./MappingHeader";

/**
 * @public
 */
export interface IHeaderPredicateContext {
    dv: DataViewFacade;
}

/**
 * @public
 */

export type IHeaderPredicate = (header: IMappingHeader, context: IHeaderPredicateContext) => boolean;

/**
 * @public
 */
export function isHeaderPredicate(obj: any): obj is IHeaderPredicate {
    return typeof obj === "function";
}
