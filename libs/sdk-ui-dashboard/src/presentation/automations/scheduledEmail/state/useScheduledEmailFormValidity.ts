// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    isAutomationExternalUserRecipient,
    isAutomationUnknownUserRecipient,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";

import { areAutomationsEqual } from "../../shared/utils/automationUtils.js";
import { useScheduleValidation } from "../DefaultScheduledEmailDialog/hooks/useScheduleValidation.js";
import { isEmail } from "../utils/validate.js";

export interface IUseScheduledEmailFormValidityProps {
    editedAutomation: IAutomationMetadataObjectDefinition;
    originalAutomation: IAutomationMetadataObjectDefinition;
    scheduledExportToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    defaultRecipient: IAutomationRecipient;
    maxAutomationsRecipients: number;
    isCronValid: boolean;
    isTitleValid: boolean;
    isSubjectValid: boolean;
    isOnMessageValid: boolean;
}

export function useScheduledEmailFormValidity(props: IUseScheduledEmailFormValidityProps): {
    // `scheduledExportToEdit && areAutomationsEqual(...)` short-circuits to `undefined` (not `false`)
    // when `scheduledExportToEdit` is unset (new-schedule mode) — this is the verbatim, pre-existing
    // expression, preserved as-is; consumers treat it via truthiness.
    isSubmitDisabled: boolean | undefined;
    validationErrorMessage: string | undefined;
    isParentValid: boolean;
    allowExternalRecipients: boolean;
    allowOnlyLoggedUserRecipients: boolean;
} {
    const {
        editedAutomation,
        originalAutomation,
        scheduledExportToEdit,
        notificationChannels,
        defaultRecipient,
        maxAutomationsRecipients,
        isCronValid,
        isTitleValid,
        isSubjectValid,
        isOnMessageValid,
    } = props;

    const intl = useIntl();

    const selectedNotificationChannel = notificationChannels.find(
        (channel) => channel.id === editedAutomation.notificationChannel,
    );
    const allowExternalRecipients = selectedNotificationChannel?.allowedRecipients === "external";
    const allowOnlyLoggedUserRecipients = selectedNotificationChannel?.allowedRecipients === "creator";

    const { isValid: isParentValid } = useScheduleValidation(originalAutomation);
    const validationErrorMessage = isParentValid
        ? undefined
        : intl.formatMessage({ id: "dialogs.schedule.email.widgetError" });

    const hasAttachments = !!editedAutomation.exportDefinitions?.length;
    const hasRecipients = (editedAutomation.recipients?.length ?? 0) > 0;
    const hasValidExternalRecipients = allowExternalRecipients
        ? true
        : !editedAutomation.recipients?.some(isAutomationExternalUserRecipient);
    const hasValidCreatorRecipient = allowOnlyLoggedUserRecipients
        ? editedAutomation.recipients?.length === 1 &&
          editedAutomation.recipients[0].id === defaultRecipient.id
        : true;
    const hasNoUnknownRecipients = !editedAutomation.recipients?.some(isAutomationUnknownUserRecipient);
    const hasDestination = !!editedAutomation.notificationChannel;
    const respectsRecipientsLimit = (editedAutomation.recipients?.length ?? 0) <= maxAutomationsRecipients;
    const hasFilledEmails =
        selectedNotificationChannel?.destinationType === "smtp"
            ? editedAutomation.recipients?.every((recipient) =>
                  isAutomationUserRecipient(recipient) ? isEmail(recipient.email ?? "") : true,
              )
            : true;

    const isValid =
        isCronValid &&
        hasRecipients &&
        respectsRecipientsLimit &&
        hasAttachments &&
        hasDestination &&
        hasValidExternalRecipients &&
        hasValidCreatorRecipient &&
        hasNoUnknownRecipients &&
        hasFilledEmails &&
        isOnMessageValid &&
        isTitleValid &&
        isSubjectValid;

    const isSubmitDisabled =
        !isValid || (scheduledExportToEdit && areAutomationsEqual(originalAutomation, editedAutomation));

    return {
        isSubmitDisabled,
        validationErrorMessage,
        isParentValid,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
    };
}
