// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback, useMemo } from "react";

import {
    DashboardParameterModeValues,
    type IAutomationMetadataObjectDefinition,
    type IInsightParameterValue,
    type IdentifierRef,
    type ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectCatalogParameters } from "../../../../model/store/catalog/catalogSelectors.js";
import { selectEnableParameters } from "../../../../model/store/config/configSelectors.js";
import {
    selectEffectiveDashboardParametersForWidget,
    selectEffectiveParameterValuesForWidget,
} from "../../../../model/store/tabs/parameters/parametersSelectors.js";

import {
    type IAutomationParameter,
    availableAutomationParameters,
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
    onParameterChange: (ref: IdentifierRef, value: number) => void;
    onParameterDelete: (ref: IdentifierRef) => void;
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
    widgetRef,
}: {
    editedAutomation: IAutomationMetadataObjectDefinition | undefined;
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition | undefined>>;
    widgetRef?: ObjRef;
}): IUseAutomationAlertParameters {
    const parametersEnabled = useDashboardSelector(selectEnableParameters);
    const catalog = useDashboardSelector(selectCatalogParameters);
    const dashboardParameters = useDashboardSelector(selectEffectiveDashboardParametersForWidget(widgetRef));
    const widgetParameterValues = useDashboardSelector(selectEffectiveParameterValuesForWidget(widgetRef));
    const storedParameters = editedAutomation?.alert?.execution?.parameters;

    const automationParameters = useMemo(() => {
        if (!parametersEnabled || !storedParameters?.length) {
            return EMPTY_PARAMETERS;
        }
        return (
            reconstructAutomationParametersFromValues(storedParameters, dashboardParameters, catalog)
                // `hidden` parameters stay in the stored payload but are never rendered or user-editable
                .filter((parameter) => parameter.mode !== DashboardParameterModeValues.HIDDEN)
        );
    }, [parametersEnabled, storedParameters, dashboardParameters, catalog]);

    const availableParameters = useMemo(
        () =>
            parametersEnabled
                ? availableAutomationParameters(
                      catalog,
                      automationParameters,
                      dashboardParameters,
                      widgetParameterValues,
                  )
                : EMPTY_PARAMETERS,
        [parametersEnabled, catalog, automationParameters, dashboardParameters, widgetParameterValues],
    );

    const updateAlertParameters = useCallback(
        (update: (current: IInsightParameterValue[]) => IInsightParameterValue[]) => {
            setEditedAutomation((definition) =>
                definition?.alert
                    ? setAlertExecutionParameters(
                          definition,
                          update(definition.alert.execution.parameters ?? []),
                      )
                    : definition,
            );
        },
        [setEditedAutomation],
    );

    const onParameterChange = useCallback(
        (ref: IdentifierRef, value: number) => {
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

    return {
        automationParameters,
        availableParameters,
        onParameterChange,
        onParameterDelete,
        onParameterAdd,
    };
}
