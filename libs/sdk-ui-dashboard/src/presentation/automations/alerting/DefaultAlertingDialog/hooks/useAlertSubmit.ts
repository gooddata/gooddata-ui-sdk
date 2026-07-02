// (C) 2026 GoodData Corporation

import { useRef, useState } from "react";

import { useIntl } from "react-intl";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type ISeparators,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError, convertError } from "@gooddata/sdk-ui";

import { useAlertingDialogContext } from "../../../contexts/AlertingDialogContext.js";
import { type AlertMetric } from "../../types.js";
import { getDescription } from "../utils/getters.js";

export interface IUseAlertSubmitProps {
    editedAutomation: IAutomationMetadataObjectDefinition | undefined;
    supportedMeasures: AlertMetric[];
    separators?: ISeparators;
    alertToEdit?: IAutomationMetadataObject;
    onSuccess?: (alert: IAutomationMetadataObject) => void;
    onError?: (error: GoodDataSdkError) => void;
    onSaveSuccess?: (alert: IAutomationMetadataObject) => void;
    onSaveError?: (error: GoodDataSdkError) => void;
}

export function useAlertSubmit({
    editedAutomation,
    supportedMeasures,
    separators,
    alertToEdit,
    onSuccess,
    onError,
    onSaveSuccess,
    onSaveError,
}: IUseAlertSubmitProps): {
    isSaving: boolean;
    submit: () => Promise<void>;
} {
    const intl = useIntl();
    const { createAlert, saveAlert } = useAlertingDialogContext();
    const [isSaving, setIsSaving] = useState(false);
    const submitInFlight = useRef(false);

    const submit = async (): Promise<void> => {
        if (!editedAutomation || submitInFlight.current) {
            return;
        }
        submitInFlight.current = true;
        setIsSaving(true);
        try {
            const sanitizedAutomation = editedAutomation.title
                ? editedAutomation
                : {
                      ...editedAutomation,
                      title: getDescription(
                          intl,
                          supportedMeasures,
                          editedAutomation as IAutomationMetadataObject,
                          separators,
                      ),
                  };
            if (alertToEdit) {
                const saved = await saveAlert(sanitizedAutomation as IAutomationMetadataObject);
                onSaveSuccess?.(saved);
            } else {
                const created = await createAlert(sanitizedAutomation);
                onSuccess?.(created);
            }
        } catch (err) {
            if (alertToEdit) {
                onSaveError?.(convertError(err));
            } else {
                onError?.(convertError(err));
            }
        } finally {
            submitInFlight.current = false;
            setIsSaving(false);
        }
    };

    return { isSaving, submit };
}
