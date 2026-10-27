// (C) 2026 GoodData Corporation

import { type IdentifierRef, type ParameterValue } from "@gooddata/sdk-model";

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
}: ChangeParameterValuesParams): IChangeParameterValues {
    return {
        type: "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        correlationId,
        payload: {
            parameters,
            tabLocalIdentifier,
            ...(restorePerTabOriginals ? { restorePerTabOriginals } : {}),
        },
    };
}
