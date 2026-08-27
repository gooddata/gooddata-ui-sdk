// (C) 2026 GoodData Corporation

import { type Ref, useMemo } from "react";

import { defineMessage, useIntl } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import {
    type IAutomationDialogActionBarProps,
    type IAutomationDialogDestinationProps,
    type IAutomationDialogRecipientsProps,
} from "../../shared/slots/types.js";
import { isAnomalyDetection } from "../DefaultAlertingDialog/utils/guards.js";
import { isMobileView } from "../DefaultAlertingDialog/utils/responsive.js";
import { type AlertingDialogHeaderDefaultProps, type IAlertingDialogFiltersProps } from "../types.js";

import { useAlertActions } from "./AlertActionsContext.js";
import { useAlertData } from "./AlertDataContext.js";
import { useAlertDraft } from "./AlertDraftContext.js";
import { useAlertFilters } from "./AlertFiltersContext.js";
import { useAlertDialogValidity } from "./useAlertDialogValidity.js";
import { useAlertSelectedValues } from "./useAlertSelectedValues.js";

/**
 * Inputs of {@link useAlertingDialogHeaderProps} that come from the dialog rather than its state.
 *
 * @internal
 */
export interface IUseAlertingDialogHeaderPropsInput {
    /**
     * Closes the dialog; the header's back/close button calls it.
     */
    onCancel?: () => void;

    /**
     * The dialog's initial-focus ref, attached to the title input.
     */
    ref?: Ref<HTMLInputElement>;
}

/**
 * The exact props the default alerting dialog renders its header region with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @internal
 */
export function useAlertingDialogHeaderProps({
    onCancel,
    ref,
}: IUseAlertingDialogHeaderPropsInput): AlertingDialogHeaderDefaultProps {
    const intl = useIntl();
    const { isSecondaryTitleVisible } = useAutomationsContext();
    const { widgetTitle } = useAlertingDialogContext();
    const { editedAutomation } = useAlertDraft();
    const { onTitleChange } = useAlertActions();
    const { isParentValid } = useAlertDialogValidity();

    const secondaryTitleIcon = useMemo(
        () => (
            <UiIcon
                type="visualization"
                size={16}
                color="complementary-6"
                accessibilityConfig={{
                    ariaLabel: intl.formatMessage({
                        id: "dialogs.automation.icon.ariaLabel.sourceVisualization",
                    }),
                }}
            />
        ),
        [intl],
    );

    return {
        title: editedAutomation?.title ?? "",
        onChange: onTitleChange,
        onCancel,
        placeholder: intl.formatMessage({ id: "dialogs.alert.title.placeholder" }),
        ref,
        secondaryTitle: widgetTitle,
        secondaryTitleIcon,
        isSecondaryTitleVisible: isSecondaryTitleVisible ? isParentValid : undefined,
    };
}

/**
 * The exact props the default alerting dialog renders its filters region with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @internal
 */
export function useAlertingDialogFiltersProps(): IAlertingDialogFiltersProps {
    const { editedAutomation } = useAlertDraft();
    const {
        availableFilters,
        selectedFilters,
        onFiltersChange,
        automationParameters,
        availableParameters,
        onParameterAdd,
        onParameterChange,
        onParameterDelete,
    } = useAlertFilters();

    return {
        availableFilters,
        selectedFilters,
        onFiltersChange,
        disableDateFilters: isAnomalyDetection(editedAutomation?.alert),
        parameters: automationParameters,
        availableParameters,
        onParameterAdd,
        onParameterChange,
        onParameterDelete,
    };
}

/**
 * The exact props the default alerting dialog renders its destination region with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @internal
 */
export function useAlertingDialogDestinationProps(): IAutomationDialogDestinationProps {
    const { notificationChannels } = useAlertingDialogContext();
    const { editedAutomation } = useAlertDraft();
    const { onDestinationChange } = useAlertActions();

    return {
        notificationChannels,
        selectedNotificationChannelId: editedAutomation?.notificationChannel,
        onChange: onDestinationChange,
    };
}

/**
 * The exact props the default alerting dialog renders its recipients region with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @internal
 */
export function useAlertingDialogRecipientsProps(): IAutomationDialogRecipientsProps {
    const { maxAutomationsRecipients, externalRecipient: externalRecipientOverride } =
        useAutomationsContext();
    const { notificationChannels } = useAlertingDialogContext();
    const { editedAutomation } = useAlertDraft();
    const { onRecipientsChange } = useAlertActions();
    const { defaultUser } = useAlertData();
    const { allowExternalRecipients, allowOnlyLoggedUserRecipients } = useAlertSelectedValues();

    return {
        loggedUser: defaultUser,
        value: editedAutomation?.recipients ?? [],
        onChange: onRecipientsChange,
        allowEmptySelection: true,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        maxRecipients: maxAutomationsRecipients,
        notificationChannels,
        notificationChannelId: editedAutomation?.notificationChannel,
        externalRecipientOverride,
    };
}

/**
 * Inputs of {@link useAlertingDialogActionBarProps} that come from the dialog rather than its state.
 *
 * @internal
 */
export interface IUseAlertingDialogActionBarPropsInput {
    /**
     * Closes the dialog without saving.
     */
    onCancel?: () => void;

    /**
     * Submits the automation; the dialog's single submit path (see `useAlertSubmit`).
     */
    onSubmit: () => void;

    /**
     * Whether a save is in flight.
     */
    isSaving: boolean;

    /**
     * Opens the delete confirmation. Rendered only when an existing alert is being edited.
     */
    onDelete?: () => void;
}

/**
 * The exact props the default alerting dialog renders its action bar with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @internal
 */
export function useAlertingDialogActionBarProps({
    onCancel,
    onSubmit,
    isSaving,
    onDelete,
}: IUseAlertingDialogActionBarPropsInput): IAutomationDialogActionBarProps {
    const intl = useIntl();
    const { isWhiteLabeled, isExecutionTimestampMode } = useAutomationsContext();
    const { alertToEdit } = useAlertingDialogContext();
    const { isSubmitDisabled } = useAlertDialogValidity();

    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.alerting.footer.title.short" }).id
        : defineMessage({ id: "dialogs.alerting.footer.title" }).id;

    return {
        cancelButtonText: intl.formatMessage({ id: "cancel" }),
        submitButtonText: alertToEdit
            ? intl.formatMessage({ id: "save" })
            : intl.formatMessage({ id: "create" }),
        onCancel: () => onCancel?.(),
        onSubmit,
        isSubmitDisabled: isSubmitDisabled || isSaving || isExecutionTimestampMode,
        isSaving,
        submitButtonTooltipText: isExecutionTimestampMode
            ? intl.formatMessage({ id: "dialogs.alert.save.executionTimestampMode" })
            : undefined,
        ...(isWhiteLabeled
            ? {}
            : {
                  helpLinkText: intl.formatMessage({ id: helpTextId }),
                  helpLinkHref: "https://www.gooddata.com/docs/cloud/create-dashboards/automation/alerts/",
              }),
        ...(alertToEdit && onDelete
            ? {
                  deleteButtonText: intl.formatMessage({ id: "delete" }),
                  onDelete,
              }
            : {}),
    };
}
