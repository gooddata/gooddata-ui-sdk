// (C) 2026 GoodData Corporation

import { useRef, useState } from "react";

import { useIntl } from "react-intl";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { convertError } from "@gooddata/sdk-ui";

import { useAlertingDialogContext } from "../../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";
import { useAlertData } from "../../state/AlertDataContext.js";
import { useAlertDraft } from "../../state/AlertDraftContext.js";
import { type IAlertingDialogProps } from "../../types.js";
import { getDescription } from "../utils/getters.js";

/**
 * Lifecycle callbacks of {@link useAlertSubmit}: the dialog's own `onSuccess`/`onError` (create) and
 * `onSaveSuccess`/`onSaveError` (edit).
 *
 * @internal
 */
export type IUseAlertSubmitCallbacks = Pick<
    IAlertingDialogProps,
    "onSuccess" | "onError" | "onSaveSuccess" | "onSaveError"
>;

/**
 * Submits the alerting dialog's draft: creates a new alert or saves the edited one, deriving a title
 * when the draft has none, and routes the result to the matching callback. Guards against a second
 * submit while one is in flight.
 *
 * Reads the draft, the supported measures, the edited alert and the separators from the alerting
 * contexts, so it throws outside the alerting dialog's state providers.
 *
 * @internal
 */
export function useAlertSubmit({
    onSuccess,
    onError,
    onSaveSuccess,
    onSaveError,
}: IUseAlertSubmitCallbacks): {
    isSaving: boolean;
    submit: () => Promise<void>;
} {
    const intl = useIntl();
    const { separators } = useAutomationsContext();
    const { createAlert, saveAlert, alertToEdit } = useAlertingDialogContext();
    const { editedAutomation } = useAlertDraft();
    const { supportedMeasures } = useAlertData();
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
