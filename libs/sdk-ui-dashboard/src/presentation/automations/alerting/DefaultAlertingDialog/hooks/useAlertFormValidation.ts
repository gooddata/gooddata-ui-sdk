// (C) 2026 GoodData Corporation

import { isEqual } from "lodash-es";
import { useIntl } from "react-intl";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type ICatalogDateDataset,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
    isAutomationExternalUserRecipient,
    isAutomationUnknownUserRecipient,
    isAutomationUserRecipient,
} from "@gooddata/sdk-model";

import { isEmail } from "../../../scheduledEmail/utils/validate.js";
import { isAlertValueDefined } from "../utils/guards.js";

import { useAlertValidation } from "./useAlertValidation.js";

export interface IUseAlertFormValidationProps {
    editedAutomation: IAutomationMetadataObjectDefinition | undefined;
    originalAutomation: IAutomationMetadataObjectDefinition | undefined;
    alertToEdit?: IAutomationMetadataObject;
    widget?: IWidget;
    insight?: IInsight;
    catalogDateDatasets: ICatalogDateDataset[];
    isInvalidConnectionToInsight: boolean;
    selectedNotificationChannel:
        | INotificationChannelIdentifier
        | INotificationChannelMetadataObject
        | undefined;
    allowExternalRecipients: boolean;
    allowOnlyLoggedUserRecipients: boolean;
    maxAutomationsRecipients: number;
    defaultRecipient: IAutomationRecipient;
    isTitleValid: boolean;
}

export function useAlertFormValidation(props: IUseAlertFormValidationProps): {
    isSubmitDisabled: boolean;
    validationErrorMessage: string | undefined;
    isParentValid: boolean;
} {
    const {
        editedAutomation,
        originalAutomation,
        alertToEdit,
        widget,
        insight,
        catalogDateDatasets,
        isInvalidConnectionToInsight,
        selectedNotificationChannel,
        allowExternalRecipients,
        allowOnlyLoggedUserRecipients,
        maxAutomationsRecipients,
        defaultRecipient,
        isTitleValid,
    } = props;

    const intl = useIntl();

    const { isValid: isOriginalAutomationValid, invalidityReason } = useAlertValidation(
        originalAutomation as IAutomationMetadataObject,
        widget,
        insight,
        catalogDateDatasets,
        undefined,
    );

    const isParentValid = invalidityReason !== "missingWidget";

    const validationErrorMessage = isOriginalAutomationValid
        ? undefined
        : isInvalidConnectionToInsight
          ? intl.formatMessage({ id: "insightAlert.config.invalidWidget" })
          : intl.formatMessage({ id: "insightAlert.config.unusedWidget" });

    const hasValidThreshold = isAlertValueDefined(editedAutomation?.alert);

    const hasRecipients = (editedAutomation?.recipients?.length ?? 0) > 0;
    const hasValidExternalRecipients = allowExternalRecipients
        ? true
        : !editedAutomation?.recipients?.some(isAutomationExternalUserRecipient);

    const hasValidCreatorRecipient = allowOnlyLoggedUserRecipients
        ? editedAutomation?.recipients?.length === 1 &&
          editedAutomation?.recipients[0].id === defaultRecipient.id
        : true;

    const hasNoUnknownRecipients = !editedAutomation?.recipients?.some(isAutomationUnknownUserRecipient);

    const respectsRecipientsLimit = (editedAutomation?.recipients?.length ?? 0) <= maxAutomationsRecipients;

    const hasFilledEmails =
        selectedNotificationChannel?.destinationType === "smtp"
            ? editedAutomation?.recipients?.every((recipient) =>
                  isAutomationUserRecipient(recipient) ? isEmail(recipient.email ?? "") : true,
              )
            : true;

    const isValid =
        !!editedAutomation &&
        hasRecipients &&
        respectsRecipientsLimit &&
        hasValidExternalRecipients &&
        hasValidCreatorRecipient &&
        hasNoUnknownRecipients &&
        hasFilledEmails &&
        hasValidThreshold &&
        isTitleValid;

    const isSubmitDisabled = !!(!isValid || (alertToEdit && isEqual(originalAutomation, editedAutomation)));

    return {
        isSubmitDisabled,
        validationErrorMessage,
        isParentValid,
    };
}
