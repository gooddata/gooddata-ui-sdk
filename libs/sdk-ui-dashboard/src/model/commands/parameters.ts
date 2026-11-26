// (C) 2026 GoodData Corporation

import { type IdentifierRef, type ObjRef, type ParameterValue } from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";

/**
 * A runtime value to write for one parameter. `undefined` clears the runtime override.
 *
 * @alpha
 */
export interface IParameterValueChange {
    ref: IdentifierRef;
    value: ParameterValue | undefined;
}

/**
 * Params for {@link changeParameterValues} command.
 *
 * @internal
 */
export type ChangeParameterValuesParams = {
    parameters: IParameterValueChange[];
    /**
     * Target tab. When omitted, the runtime overrides are applied to the active tab.
     */
    tabLocalIdentifier?: string;
    correlationId?: string;
    /**
     * See {@link IChangeParameterValuesPayload.restorePerTabOriginals}.
     */
    restorePerTabOriginals?: boolean;
    /**
     * See {@link IChangeParameterValuesPayload.setAsOriginalToo}.
     */
    setAsOriginalToo?: boolean;
};

/**
 * Payload of the {@link IChangeParameterValues} command.
 *
 * @internal
 */
export interface IChangeParameterValuesPayload {
    readonly parameters: IParameterValueChange[];
    readonly tabLocalIdentifier?: string;
    /**
     * When true, tabs other than the one this command addresses reset the parameters that tab
     * defines to their own reset values instead of receiving this payload. Used by filter reset
     * when filters are persisted across tabs.
     */
    readonly restorePerTabOriginals?: boolean;
    /**
     * When true, the values this command writes become the values a reset restores, on this tab and
     * on every tab they are synced to. Used when a default filter view initializes the shared state.
     */
    readonly setAsOriginalToo?: boolean;
}

/**
 * Command for setting runtime parameter overrides.
 *
 * @remarks
 * See {@link changeParameterValues} for a factory function that will help you create this command.
 *
 * @internal
 */
export interface IChangeParameterValues extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES";
    readonly payload: IChangeParameterValuesPayload;
}

/**
 * Creates the {@link IChangeParameterValues} command.
 *
 * @remarks
 * Dispatching this command sets the provided parameter values as runtime overrides on the
 * target tab, or the active tab when none is named. When persistent filters across tabs are
 * enabled, the same values are written to every tab that already defines the parameter.
 * Unknown parameter refs are ignored.
 *
 * Mirrors {@link changeFilterContextSelectionByParams} for parameters, so drill targets can
 * inherit the source dashboard's active parameter overrides.
 *
 * @param params - params for the command creator
 * @internal
 */
export function changeParameterValues({
    parameters,
    tabLocalIdentifier,
    correlationId,
    restorePerTabOriginals,
    setAsOriginalToo,
}: ChangeParameterValuesParams): IChangeParameterValues {
    return {
        type: "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        correlationId,
        payload: {
            parameters,
            tabLocalIdentifier,
            ...(restorePerTabOriginals ? { restorePerTabOriginals } : {}),
            ...(setAsOriginalToo ? { setAsOriginalToo } : {}),
        },
    };
}

/**
 * Payload of the {@link IAddParameters} command.
 *
 * @internal
 */
export interface IAddParametersPayload {
    readonly refs: IdentifierRef[];
    /**
     * The tab the user added the parameters on. The command fails when this tab is not the active tab.
     */
    readonly tabLocalIdentifier: string;
}

/**
 * Command for adding workspace parameters to the active tab.
 *
 * @remarks
 * See {@link addParameters} for a factory function that will help you create this command.
 *
 * @internal
 */
export interface IAddParameters extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.PARAMETERS.ADD";
    readonly payload: IAddParametersPayload;
}

/**
 * Creates the {@link IAddParameters} command.
 *
 * @remarks
 * Dispatching this command adds the workspace parameters to the active tab in active mode. The command
 * fails when the tab is not the active tab, when a ref is not in the parameter catalog or when a ref is
 * already on the tab.
 *
 * @param refs - refs of the workspace parameters to add
 * @param tabLocalIdentifier - local identifier of the tab the user added the parameters on
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @internal
 */
export function addParameters(
    refs: IdentifierRef[],
    tabLocalIdentifier: string,
    correlationId?: string,
): IAddParameters {
    return {
        type: "GDC.DASH/CMD.PARAMETERS.ADD",
        correlationId,
        payload: {
            refs,
            tabLocalIdentifier,
        },
    };
}

/**
 * Payload of the {@link IRemoveParameters} command.
 *
 * @internal
 */
export interface IRemoveParametersPayload {
    readonly refs: ObjRef[];
    /**
     * The tab the user removed the parameters from. The command fails when this tab is not the active tab.
     */
    readonly tabLocalIdentifier: string;
}

/**
 * Command for removing parameters from the active tab.
 *
 * @remarks
 * See {@link removeParameters} for a factory function that will help you create this command.
 *
 * @internal
 */
export interface IRemoveParameters extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.PARAMETERS.REMOVE";
    readonly payload: IRemoveParametersPayload;
}

/**
 * Creates the {@link IRemoveParameters} command.
 *
 * @remarks
 * Dispatching this command removes the parameters from the active tab. The command fails when the tab
 * is not the active tab or when a ref is not on the tab.
 *
 * @param refs - refs of the parameters to remove
 * @param tabLocalIdentifier - local identifier of the tab the user removed the parameters from
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @internal
 */
export function removeParameters(
    refs: ObjRef[],
    tabLocalIdentifier: string,
    correlationId?: string,
): IRemoveParameters {
    return {
        type: "GDC.DASH/CMD.PARAMETERS.REMOVE",
        correlationId,
        payload: {
            refs,
            tabLocalIdentifier,
        },
    };
}
