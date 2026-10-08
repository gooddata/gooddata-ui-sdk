// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

/**
 * An execution of a widget that was refused because the current user may not read some of the data.
 *
 * @internal
 */
export interface IRefusedExecution {
    /**
     * Ref of the widget.
     */
    ref: ObjRef;
    /**
     * What the refused execution ran: the widget's insight, its own filters and its parameters, as
     * produced by `selectWidgetExecutionInputsKey`.
     */
    inputsKey: string;
}

/**
 * Widgets whose execution was refused because the current user may not read some of the data.
 *
 * @internal
 */
export interface IRestrictedDataState {
    /**
     * The refused executions, keyed by serialized widget ref.
     *
     * @remarks
     * A widget renders as restricted while its insight, its own filters and its parameters are the ones
     * it was refused with. A later execution leaves the entry in place until it finishes, so the widget does not show
     * its content between attempts.
     */
    refusedExecutions: Record<string, IRefusedExecution>;
}

export const restrictedDataInitialState: IRestrictedDataState = {
    refusedExecutions: {},
};
