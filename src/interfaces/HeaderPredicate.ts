// (C) 2007-2018 GoodData Corporation
import { AFM, Execution } from "@gooddata/typings";
import { IMappingHeader } from "./MappingHeader";
import { IDrillableItem } from "./DrillEvents";

export interface IHeaderPredicateContext {
    afm: AFM.IAfm;
    executionResponse: Execution.IExecutionResponse;
}

export type IHeaderPredicate = (header: IMappingHeader, context: IHeaderPredicateContext) => boolean;

export function isHeaderPredicate(item: IDrillableItem | IHeaderPredicate): item is IHeaderPredicate {
    return typeof item === "function";
}
