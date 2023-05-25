// (C) 2007-2022 GoodData Corporation
import { IMappingHeader } from "./MappingHeader.js";
import { DataViewFacade } from "../results/facade.js";

/**
 * Additional data that describes the context in which the {@link IHeaderPredicate} match is being tested.
 *
 * @public
 */
export interface IHeaderPredicateContext {
    dv: DataViewFacade;
}

/**
 * A function called for {@link IMappingHeader} instances.
 *
 * @remarks
 * When the function returns true, it means the IMappingHeader is matched.
 * See {@link https://sdk.gooddata.com/gooddata-ui/docs/ht_create_predicates.html | documentation} for more information.
 *
 * @public
 */
export type IHeaderPredicate = (header: IMappingHeader, context: IHeaderPredicateContext) => boolean;

/**
 * Typeguard checking whether the object is an {@link IHeaderPredicate} instance.
 * @public
 */
export function isHeaderPredicate(obj: unknown): obj is IHeaderPredicate {
    return typeof obj === "function";
}
