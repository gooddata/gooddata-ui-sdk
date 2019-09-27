// (C) 2007-2018 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { AFM, Execution } from "@gooddata/gd-bear-model";
import { IMappingHeader } from "./MappingHeader";
import { IDrillableItem } from "./DrillEvents";

/*
 * TODO: SDK8: once _defunct is gone, we can switch header predicate and context implementations
 */

// delete
export interface IHeaderPredicateContext {
    afm: AFM.IAfm;
    executionResponse: Execution.IExecutionResponse;
}

// delete
export type IHeaderPredicate = (header: IMappingHeader, context: IHeaderPredicateContext) => boolean;

// keep & rename
export interface IHeaderPredicateContext2 {
    dv: DataViewFacade;
}

// keep & rename
export type IHeaderPredicate2 = (header: IMappingHeader, context: IHeaderPredicateContext2) => boolean;

// keep
export function isHeaderPredicate(item: IDrillableItem | IHeaderPredicate2): item is IHeaderPredicate2 {
    return typeof item === "function";
}
