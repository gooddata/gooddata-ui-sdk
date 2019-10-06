// (C) 2007-2018 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { IMappingHeader } from "./MappingHeader";
import { IDrillableItem } from "./DrillEvents";

/*
 * TODO: SDK8: once _defunct is gone, we can switch header predicate and context implementations
 */

// keep & rename
export interface IHeaderPredicateContext {
    dv: DataViewFacade;
}

// keep & rename
export type IHeaderPredicate = (header: IMappingHeader, context: IHeaderPredicateContext) => boolean;

// keep
export function isHeaderPredicate(item: IDrillableItem | IHeaderPredicate): item is IHeaderPredicate {
    return typeof item === "function";
}
