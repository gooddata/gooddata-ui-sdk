// (C) 2026 GoodData Corporation

import { type IInsightParameterValue } from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";

/**
 * Params for {@link changeParameterValues} command.
 *
 * @internal
 */
export type ChangeParameterValuesParams = {
    parameters: IInsightParameterValue[];
    correlationId?: string;
};

/**
 * Payload of the {@link IChangeParameterValues} command.
 *
 * @internal
 */
export interface IChangeParameterValuesPayload {
    readonly parameters: IInsightParameterValue[];
}

/**
 * Command for setting runtime parameter overrides on the currently active tab.
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
 * currently active tab. Only parameters already present on the active tab are affected; values
 * for unknown parameter refs are ignored.
 *
 * Mirrors {@link changeFilterContextSelectionByParams} for parameters, so drill targets can
 * inherit the source dashboard's active parameter overrides.
 *
 * @param params - params for the command creator
 * @internal
 */
export function changeParameterValues({
    parameters,
    correlationId,
}: ChangeParameterValuesParams): IChangeParameterValues {
    return {
        type: "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        correlationId,
        payload: {
            parameters,
        },
    };
}
