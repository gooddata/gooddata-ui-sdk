// (C) 2007-2022 GoodData Corporation
import { type IMappingHeader } from "./MappingHeader.js";
import { type DataViewFacade } from "../results/facade.js";

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
 * See {@link https://www.gooddata.com/docs/gooddata-ui/latest/learn/add_interactivity/predicates | documentation} for more information.
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
