// (C) 2007-2020 GoodData Corporation
import { IMappingHeader } from "./MappingHeader";
import { DataViewFacade } from "../results/facade";

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
export function isHeaderPredicate(obj: unknown): obj is IHeaderPredicate {
    return typeof obj === "function";
}
