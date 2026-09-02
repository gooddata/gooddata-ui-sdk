// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback, useMemo } from "react";

import {
    DashboardParameterModeValues,
    type IAutomationMetadataObjectDefinition,
    type IDashboardParameter,
    type IInsightParameterValue,
    type IdentifierRef,
    type ParameterValue,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { getAutomationAlertParameters } from "../../../../_staging/automation/index.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";

import {
    type IAutomationParameter,
    availableAutomationParameters,
    dropStaleAlertParameters,
    hasStaleAlertParameters,
    reconstructAutomationParametersFromValues,
    setAlertExecutionParameters,
} from "./automationParameters.js";

const EMPTY_PARAMETERS: IAutomationParameter[] = [];

/**
 * @internal
 */
export interface IUseAutomationAlertParameters {
    /**
     * The parameter chips to render. Empty when the `enableParameters` feature is off.
     */
    automationParameters: IAutomationParameter[];
    /**
     * Workspace parameters addable via the "+" menu (catalog minus the selected set and minus
     * dashboard-`hidden`/`readonly` parameters). Empty when the feature is off.
     */
    availableParameters: IAutomationParameter[];
    onParameterAdd: (ref: IdentifierRef) => void;
    onParameterChange: (ref: IdentifierRef, value: ParameterValue) => void;
    onParameterDelete: (ref: IdentifierRef) => void;
    /**
     * Surgically drops stored parameters whose `ref` left the workspace catalog, keeping every
     * other override. Used to repair an alert when "apply current filters" resolves staleness.
     */
    dropStaleParameters: () => void;
}

/**
 * Parameter editing for the alert dialog. The single source of truth is the edited automation's
 * `alert.execution.parameters` ({ref, value} wire shape); the display-ready set is derived per render.
 *
 * @internal
 */
export function useAutomationAlertParameters({
    editedAutomation,
    setEditedAutomation,
    dashboardParameters,
    widgetParameterValues,
}: {
    editedAutomation: IAutomationMetadataObjectDefinition | undefined;
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition | undefined>>;
    /**
     * Effective dashboard parameters for the dialog's widget; from
     * {@link IAlertingDialogContextValue.dashboardParameters}.
     */
    dashboardParameters: IDashboardParameter[];
    /**
     * Effective widget parameter values for the dialog's widget; from
     * {@link IAlertingDialogContextValue.parameterValues}.
     */
    widgetParameterValues: IInsightParameterValue[];
}): IUseAutomationAlertParameters {
    const {
        parameters: { enabled: parametersEnabled, stringParametersEnabled, catalog, catalogIsLoaded },
    } = useAutomationsContext();
    const storedParameters = getAutomationAlertParameters(editedAutomation);

    const automationParameters = useMemo(() => {
        if (!parametersEnabled || !storedParameters?.length) {
            return EMPTY_PARAMETERS;
        }
        return (
            // `true`: alert values load as untyped wire strings (unlike tag-typed export values)
            reconstructAutomationParametersFromValues(
                storedParameters,
                dashboardParameters,
                catalog,
                stringParametersEnabled,
                true,
            )
                // `hidden` parameters stay in the stored payload but are never rendered or user-editable
                .filter((parameter) => parameter.mode !== DashboardParameterModeValues.HIDDEN)
        );
    }, [parametersEnabled, stringParametersEnabled, storedParameters, dashboardParameters, catalog]);

    const availableParameters = useMemo(
        () =>
            parametersEnabled
                ? availableAutomationParameters(
                      catalog,
                      automationParameters,
                      dashboardParameters,
                      widgetParameterValues,
                      stringParametersEnabled,
                  )
                : EMPTY_PARAMETERS,
        [
            parametersEnabled,
            catalog,
            automationParameters,
            dashboardParameters,
            widgetParameterValues,
            stringParametersEnabled,
        ],
    );

    const updateAlertParameters = useCallback(
        (update: (current: IInsightParameterValue[]) => IInsightParameterValue[]) => {
            setEditedAutomation((definition) =>
                definition?.alert
                    ? setAlertExecutionParameters(
                          definition,
                          update(getAutomationAlertParameters(definition) ?? []),
                      )
                    : definition,
            );
        },
        [setEditedAutomation],
    );

    const onParameterChange = useCallback(
        (ref: IdentifierRef, value: ParameterValue) => {
            updateAlertParameters((current) =>
                current.map((parameter) =>
                    areObjRefsEqual(parameter.ref, ref) ? { ...parameter, value } : parameter,
                ),
            );
        },
        [updateAlertParameters],
    );

    const onParameterDelete = useCallback(
        (ref: IdentifierRef) => {
            updateAlertParameters((current) =>
                current.filter((parameter) => !areObjRefsEqual(parameter.ref, ref)),
            );
        },
        [updateAlertParameters],
    );

    const onParameterAdd = useCallback(
        (ref: IdentifierRef) => {
            const parameter = availableParameters.find((candidate) => areObjRefsEqual(candidate.ref, ref));
            if (parameter) {
                updateAlertParameters((current) => [...current, { ref, value: parameter.value }]);
            }
        },
        [availableParameters, updateAlertParameters],
    );

    const dropStaleParameters = useCallback(() => {
        // Pruning against an unloaded/gated (empty) catalog would wipe every still-valid override.
        if (!parametersEnabled || !catalogIsLoaded) {
            return;
        }
        // Write only when something is actually stale.
        setEditedAutomation((definition) => {
            const stored = getAutomationAlertParameters(definition);
            if (!definition?.alert || !hasStaleAlertParameters(stored, catalog)) {
                return definition;
            }
            return setAlertExecutionParameters(definition, dropStaleAlertParameters(stored ?? [], catalog));
        });
    }, [parametersEnabled, catalogIsLoaded, catalog, setEditedAutomation]);

    return {
        automationParameters,
        availableParameters,
        onParameterChange,
        onParameterDelete,
        onParameterAdd,
        dropStaleParameters,
    };
}
