// (C) 2007-2018 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { AFM, Execution } from "@gooddata/gd-bear-model";
import { IMappingHeader } from "./MappingHeader";
import { IDrillableItem } from "./DrillEvents";

export interface IHeaderPredicateContext {
    afm: AFM.IAfm;
    executionResponse: Execution.IExecutionResponse;
}

export type IHeaderPredicate = (header: IMappingHeader, context: IHeaderPredicateContext) => boolean;

export interface IHeaderPredicateContext2 {
    dv: DataViewFacade;
}

export type IHeaderPredicate2 = (header: IMappingHeader, context: IHeaderPredicateContext2) => boolean;

export function isHeaderPredicate(item: IDrillableItem | IHeaderPredicate): item is IHeaderPredicate {
    return typeof item === "function";
}
