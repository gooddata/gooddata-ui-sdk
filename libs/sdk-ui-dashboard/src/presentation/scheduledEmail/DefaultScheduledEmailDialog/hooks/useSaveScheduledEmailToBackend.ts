// (C) 2019-2024 GoodData Corporation
import { useCallback } from "react";
import {
    ObjRef,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IAutomationSchedule,
} from "@gooddata/sdk-model";
import { useCreateScheduledEmail } from "./useCreateScheduledEmail.js";
import { useUpdateScheduledEmail } from "./useUpdateScheduledEmail.js";
import { IScheduledEmailDialogProps } from "../../types.js";
import { IntlShape, useIntl } from "react-intl";
import omit from "lodash/omit.js";

export function useSaveScheduledEmailToBackend(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    { onSuccess, onError, onSubmit, onSaveSuccess, onSaveError, onSave }: IScheduledEmailDialogProps,
) {
    const intl = useIntl();
    const scheduledEmailCreator = useCreateScheduledEmail({
        onSuccess,
        onError,
        onBeforeRun: onSubmit,
    });
    const handleCreateScheduledEmail = useCallback(
        (scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition) => {
            scheduledEmailCreator.create(scheduledEmail as IAutomationMetadataObjectDefinition);
        },
        [scheduledEmailCreator],
    );

    const scheduledEmailUpdater = useUpdateScheduledEmail({
        onSuccess: onSaveSuccess,
        onError: onSaveError,
        onBeforeRun: onSave,
    });

    const handleUpdateScheduledEmail = useCallback(
        (
            scheduledEmail: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
            filterContextRef?: ObjRef,
        ) => {
            scheduledEmailUpdater.save(scheduledEmail as IAutomationMetadataObject, filterContextRef);
        },
        [scheduledEmailUpdater],
    );

    const handleSaveScheduledEmail = (): void => {
        const sanitizedAutomation = sanitizeAutomation(automation, intl);
        if (sanitizedAutomation.id) {
            handleUpdateScheduledEmail(sanitizedAutomation);
        } else {
            handleCreateScheduledEmail(sanitizedAutomation);
        }
    };

    const isSavingScheduledEmail =
        scheduledEmailCreator.creationStatus === "running" ||
        scheduledEmailUpdater.savingStatus === "running";

    return { handleSaveScheduledEmail, isSavingScheduledEmail };
}

function sanitizeAutomation(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    intl: IntlShape,
) {
    if (!automation.title) {
        automation.title = intl.formatMessage({ id: "dialogs.schedule.email.title.placeholder" });
    }

    // We want to omit the cronDescription as it a variable created on backend that cannot
    // be overriden and BE has hard time handling it with each PUT
    if (automation.schedule) {
        automation.schedule = omit(automation.schedule, ["cronDescription"]) as IAutomationSchedule;
    }

    return automation;
}
