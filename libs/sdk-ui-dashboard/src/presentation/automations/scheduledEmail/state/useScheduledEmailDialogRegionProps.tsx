// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type Ref, useMemo } from "react";

import { defineMessage, useIntl } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import {
    type IAutomationDialogActionBarProps,
    type IAutomationDialogDestinationProps,
} from "../../shared/slots/types.js";
import {
    type IScheduledEmailDialogFiltersProps,
    type IScheduledEmailDialogRecipientsProps,
    type ScheduledEmailDialogHeaderDefaultProps,
    type ScheduledEmailDialogTimezoneDefaultProps,
} from "../types.js";
import { isMobileView } from "../utils/responsive.js";

import { useScheduledExportActions } from "./ScheduledExportActionsContext.js";
import { useScheduledExportData } from "./ScheduledExportDataContext.js";
import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "./ScheduledExportFiltersContext.js";
import { useScheduledExportDialogValidity } from "./useScheduledExportDialogValidity.js";

/**
 * Inputs of {@link useScheduledEmailDialogHeaderProps} that come from the dialog rather than its state.
 *
 * @internal
 */
export interface IUseScheduledEmailDialogHeaderPropsInput {
    /**
     * Returns to the management dialog; the header's back button calls it.
     */
    onBack?: () => void;

    /**
     * Key-down handler of the title input; the dialog submits on Enter through it.
     */
    onTitleKeyDown: (event: KeyboardEvent) => void;

    /**
     * The dialog's initial-focus ref, attached to the title input.
     */
    ref?: Ref<HTMLInputElement>;
}

/**
 * The exact props the default scheduled-email dialog renders its header region with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @internal
 */
export function useScheduledEmailDialogHeaderProps({
    onBack,
    onTitleKeyDown,
    ref,
}: IUseScheduledEmailDialogHeaderPropsInput): ScheduledEmailDialogHeaderDefaultProps {
    const intl = useIntl();
    const { isSecondaryTitleVisible } = useAutomationsContext();
    const { widget, widgetTitle, dashboardTitle } = useScheduledEmailDialogContext();
    const { editedAutomation } = useScheduledExportDraft();
    const { onTitleChange } = useScheduledExportActions();
    const { isParentValid } = useScheduledExportDialogValidity();

    const { secondaryTitle, secondaryTitleIcon } = useMemo(() => {
        if (widget) {
            return {
                secondaryTitle: widgetTitle,
                secondaryTitleIcon: (
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
            };
        }
        return {
            secondaryTitle: dashboardTitle,
            secondaryTitleIcon: (
                <UiIcon
                    type="dashboard"
                    size={16}
                    color="complementary-6"
                    accessibilityConfig={{
                        ariaLabel: intl.formatMessage({
                            id: "dialogs.automation.icon.ariaLabel.sourceDashboard",
                        }),
                    }}
                />
            ),
        };
    }, [widget, widgetTitle, dashboardTitle, intl]);

    return {
        title: editedAutomation.title ?? "",
        onChange: onTitleChange,
        onBack,
        placeholder: intl.formatMessage({ id: "dialogs.schedule.email.title.placeholder" }),
        ref,
        onTitleKeyDown,
        secondaryTitle,
        secondaryTitleIcon,
        isSecondaryTitleVisible: isSecondaryTitleVisible ? isParentValid : undefined,
    };
}

/**
 * The exact props the default scheduled-email dialog renders its filters region with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @internal
 */
export function useScheduledEmailDialogFiltersProps(): IScheduledEmailDialogFiltersProps {
    const { widget } = useScheduledEmailDialogContext();
    const {
        selectedFilters,
        availableFilters,
        storeFilters,
        filtersByTab,
        editedFiltersByTab,
        onFiltersChange,
        onFiltersByTabChange,
        onStoreFiltersChange,
        parametersEnabled,
        visibleParametersByTab,
        availableParametersByTab,
        flatTabId,
        onParameterAdd,
        onParameterChange,
        onParameterDelete,
        onParameterAddByTab,
        onParameterChangeByTab,
        onParameterDeleteByTab,
    } = useScheduledExportFilters();

    return {
        availableFilters,
        selectedFilters,
        onFiltersChange,
        storeFilters,
        onStoreFiltersChange,
        isDashboardAutomation: !widget,
        filtersByTab,
        editedFiltersByTab,
        onFiltersByTabChange,
        parameters: flatTabId ? visibleParametersByTab[flatTabId] : undefined,
        availableParameters: flatTabId ? availableParametersByTab[flatTabId] : undefined,
        onParameterAdd,
        onParameterChange,
        onParameterDelete,
        parametersByTab: visibleParametersByTab,
        availableParametersByTab,
        onParameterAddByTab,
        onParameterChangeByTab,
        onParameterDeleteByTab,
        parametersEnabled,
    };
}

/**
 * The exact props the default scheduled-email dialog renders its destination region with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @internal
 */
export function useScheduledEmailDialogDestinationProps(): IAutomationDialogDestinationProps {
    const { notificationChannels } = useScheduledEmailDialogContext();
    const { editedAutomation } = useScheduledExportDraft();
    const { onDestinationChange } = useScheduledExportActions();

    return {
        notificationChannels,
        selectedNotificationChannelId: editedAutomation.notificationChannel,
        onChange: onDestinationChange,
    };
}

/**
 * Inputs of {@link useScheduledEmailDialogRecipientsProps} that come from the dialog rather than its state.
 *
 * @internal
 */
export interface IUseScheduledEmailDialogRecipientsPropsInput {
    /**
     * Key-down handler of the recipients input; the dialog submits on Enter through it.
     */
    onKeyDownSubmit: (event: KeyboardEvent) => void;
}

/**
 * The exact props the default scheduled-email dialog renders its recipients region with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @internal
 */
export function useScheduledEmailDialogRecipientsProps({
    onKeyDownSubmit,
}: IUseScheduledEmailDialogRecipientsPropsInput): IScheduledEmailDialogRecipientsProps {
    const { maxAutomationsRecipients, externalRecipient: externalRecipientOverride } =
        useAutomationsContext();
    const { notificationChannels } = useScheduledEmailDialogContext();
    const { editedAutomation } = useScheduledExportDraft();
    const { onRecipientsChange } = useScheduledExportActions();
    const { defaultUser } = useScheduledExportData();
    const { allowExternalRecipients, allowOnlyLoggedUserRecipients } = useScheduledExportDialogValidity();

    return {
        loggedUser: defaultUser,
        value: editedAutomation.recipients ?? [],
        onChange: onRecipientsChange,
        allowEmptySelection: true,
        allowOnlyLoggedUserRecipients,
        allowExternalRecipients,
        maxRecipients: maxAutomationsRecipients,
        notificationChannels,
        notificationChannelId: editedAutomation.notificationChannel,
        onKeyDownSubmit,
        externalRecipientOverride,
    };
}

/**
 * The exact props the default scheduled-email dialog renders its "Time zone" section with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @internal
 */
export function useScheduledEmailDialogTimezoneProps(): ScheduledEmailDialogTimezoneDefaultProps {
    const { widget } = useScheduledEmailDialogContext();
    const { scheduleTimezoneSelection, defaultResolvedTimezone } = useScheduledExportDraft();
    const { onScheduleTimezoneChange } = useScheduledExportActions();

    return {
        isWidget: !!widget,
        selection: scheduleTimezoneSelection,
        defaultResolvedTimezone,
        onTimezoneChange: onScheduleTimezoneChange,
    };
}

/**
 * Inputs of {@link useScheduledEmailDialogActionBarProps} that come from the dialog rather than its state.
 *
 * @internal
 */
export interface IUseScheduledEmailDialogActionBarPropsInput {
    /**
     * Closes the dialog without saving.
     */
    onCancel?: () => void;

    /**
     * Submits the automation; the dialog's single save path (see `useSaveScheduledEmailToBackend`).
     */
    onSubmit: () => void;

    /**
     * Whether a save is in flight.
     */
    isSaving: boolean;

    /**
     * Opens the delete confirmation. Rendered only when an existing schedule is being edited.
     */
    onDelete?: () => void;
}

/**
 * The exact props the default scheduled-email dialog renders its action bar with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @internal
 */
export function useScheduledEmailDialogActionBarProps({
    onCancel,
    onSubmit,
    isSaving,
    onDelete,
}: IUseScheduledEmailDialogActionBarPropsInput): IAutomationDialogActionBarProps {
    const intl = useIntl();
    const { isWhiteLabeled, isExecutionTimestampMode } = useAutomationsContext();
    const { scheduledExportToEdit } = useScheduledEmailDialogContext();
    const { isSubmitDisabled } = useScheduledExportDialogValidity();

    const helpTextId = isMobileView()
        ? defineMessage({ id: "dialogs.schedule.email.footer.title.short" }).id
        : defineMessage({ id: "dialogs.schedule.email.footer.title" }).id;

    return {
        cancelButtonText: intl.formatMessage({ id: "cancel" }),
        submitButtonText: scheduledExportToEdit
            ? intl.formatMessage({ id: "dialogs.schedule.email.save" })
            : intl.formatMessage({ id: "dialogs.schedule.email.create" }),
        onCancel: () => onCancel?.(),
        onSubmit,
        isSubmitDisabled: isSubmitDisabled || isSaving || isExecutionTimestampMode,
        isSaving,
        submitButtonTooltipText: isExecutionTimestampMode
            ? intl.formatMessage({ id: "dialogs.schedule.email.save.executionTimestampMode" })
            : undefined,
        ...(isWhiteLabeled
            ? {}
            : {
                  helpLinkText: intl.formatMessage({ id: helpTextId }),
                  helpLinkHref:
                      "https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#ScheduleExportsinDashboards-ScheduleExport",
              }),
        ...(scheduledExportToEdit && onDelete
            ? {
                  deleteButtonText: intl.formatMessage({ id: "delete" }),
                  onDelete,
              }
            : {}),
    };
}
