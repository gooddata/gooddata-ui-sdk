// (C) 2026 GoodData Corporation

import { type KeyboardEvent } from "react";

import { type DashboardAttachmentType, type WidgetAttachmentType } from "@gooddata/sdk-model";
import { getTimezoneDisplayLabel } from "@gooddata/sdk-ui-kit";

import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailDialogContext } from "../../contexts/ScheduledEmailDialogContext.js";
import {
    type IScheduledEmailDialogDashboardAttachmentsProps,
    type IScheduledEmailDialogEvaluationModeProps,
    type IScheduledEmailDialogMessageProps,
    type IScheduledEmailDialogRecurrenceProps,
    type IScheduledEmailDialogSubjectProps,
    type IScheduledEmailDialogWidgetAttachmentsProps,
} from "../types.js";
import { getDefaultCronExpression } from "../utils/cron.js";
import { TIMEZONE_DEFAULT } from "../utils/timezone.js";

import { useScheduledExportActions } from "./ScheduledExportActionsContext.js";
import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";
import { useScheduledExportAttachments } from "./useScheduledExportAttachments.js";
import { useScheduledExportDialogValidity } from "./useScheduledExportDialogValidity.js";

const CLOSE_ON_PARENT_SCROLL = true;

// Exhaustive by construction: a WidgetAttachmentType member missing here is a type error, so a
// future union widening fails the build instead of silently narrowing a saved format away.
const WIDGET_ATTACHMENT_TYPE_FLAGS: Record<WidgetAttachmentType, true> = {
    CSV: true,
    CSV_RAW: true,
    XLSX: true,
    PNG: true,
    PPTX: true,
    PDF: true,
    PDF_TABULAR: true,
    HTML: true,
};
const WIDGET_ATTACHMENT_TYPES = new Set<string>(Object.keys(WIDGET_ATTACHMENT_TYPE_FLAGS));

// Exhaustive by construction: a DashboardAttachmentType member missing here is a type error.
const DASHBOARD_ATTACHMENT_TYPE_FLAGS: Record<DashboardAttachmentType, true> = {
    PDF: true,
    PDF_SLIDES: true,
    PPTX: true,
    XLSX: true,
};
const DASHBOARD_ATTACHMENT_TYPES = new Set<string>(Object.keys(DASHBOARD_ATTACHMENT_TYPE_FLAGS));

/**
 * Inputs of {@link useScheduledEmailDialogRecurrenceProps} that come from the dialog rather than its state.
 *
 * @alpha
 */
export interface IUseScheduledEmailDialogRecurrencePropsInput {
    /**
     * Key-down handler of the recurrence inputs; the dialog submits on Enter through it.
     */
    onKeyDownSubmit: (event: KeyboardEvent) => void;
}

/**
 * The exact props the default scheduled-email dialog renders its recurrence field with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @alpha
 */
export function useScheduledEmailDialogRecurrenceProps({
    onKeyDownSubmit,
}: IUseScheduledEmailDialogRecurrencePropsInput): IScheduledEmailDialogRecurrenceProps {
    const { locale, weekStart, allowHourlyRecurrence, isWhiteLabeled } = useAutomationsContext();
    const { dateFormat } = useScheduledEmailDialogContext();
    const { editedAutomation, startDate, isTimezoneFeatureEnabled } = useScheduledExportDraft();
    const { onRecurrenceChange } = useScheduledExportActions();

    return {
        startDate,
        cronExpression: editedAutomation.schedule?.cron ?? getDefaultCronExpression(startDate),
        cronDescription: editedAutomation.schedule?.cronDescription,
        // display-only value; with the timezone feature on, show the friendly label used
        // by the time zone picker instead of the raw IANA ID
        timezone: isTimezoneFeatureEnabled
            ? getTimezoneDisplayLabel(editedAutomation.schedule?.timezone ?? TIMEZONE_DEFAULT.identifier)
            : (editedAutomation.schedule?.timezone ?? TIMEZONE_DEFAULT.identifier),
        dateFormat: dateFormat ?? "MM/dd/yyyy",
        locale,
        weekStart,
        allowHourlyRecurrence,
        isWhiteLabeled,
        closeDropdownsOnParentScroll: CLOSE_ON_PARENT_SCROLL,
        onChange: onRecurrenceChange,
        onKeyDownSubmit,
    };
}

/**
 * Inputs of {@link useScheduledEmailDialogSubjectProps} that come from the dialog rather than its state.
 *
 * @alpha
 */
export interface IUseScheduledEmailDialogSubjectPropsInput {
    /**
     * Called on Enter in the subject input when submit is not disabled.
     */
    onKeyDownSubmit: () => void;
}

/**
 * The exact props the default scheduled-email dialog renders its subject field with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @alpha
 */
export function useScheduledEmailDialogSubjectProps({
    onKeyDownSubmit,
}: IUseScheduledEmailDialogSubjectPropsInput): IScheduledEmailDialogSubjectProps {
    const { dashboardTitle } = useScheduledEmailDialogContext();
    const { editedAutomation } = useScheduledExportDraft();
    const { onSubjectChange } = useScheduledExportActions();
    const { isSubmitDisabled } = useScheduledExportDialogValidity();

    return {
        dashboardTitle,
        editedAutomation,
        isSubmitDisabled,
        onChange: onSubjectChange,
        onKeyDownSubmit,
    };
}

/**
 * The exact props the default scheduled-email dialog renders its message field with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @alpha
 */
export function useScheduledEmailDialogMessageProps(): IScheduledEmailDialogMessageProps {
    const { editedAutomation } = useScheduledExportDraft();
    const { onMessageChange } = useScheduledExportActions();

    return {
        value: editedAutomation.details?.message ?? "",
        onChange: onMessageChange,
    };
}

/**
 * The exact props the default scheduled-email dialog renders its widget-attachments field with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @alpha
 */
export function useScheduledEmailDialogWidgetAttachmentsProps(): IScheduledEmailDialogWidgetAttachmentsProps {
    const {
        settings,
        features: { enableSlideshowExports },
    } = useAutomationsContext();
    const { exportTemplates } = useScheduledEmailDialogContext();
    const { selectedAttachments, xlsxSettings, pdfSettings, csvSettings, csvRawSettings, slidesTemplateIds } =
        useScheduledExportAttachments();
    const {
        onWidgetAttachmentsChange,
        onXlsxSettingsChange,
        onPdfSettingsChange,
        onCsvSettingsChange,
        onCsvRawSettingsChange,
        onSlidesTemplateIdChange,
    } = useScheduledExportActions();

    return {
        selectedAttachments: selectedAttachments.filter((attachment): attachment is WidgetAttachmentType =>
            WIDGET_ATTACHMENT_TYPES.has(attachment),
        ),
        onWidgetAttachmentsChange,
        xlsxSettings,
        onXlsxSettingsChange,
        pdfSettings,
        onPdfSettingsChange,
        csvSettings,
        onCsvSettingsChange,
        csvRawSettings,
        onCsvRawSettingsChange,
        isSlidesExportEnabled: enableSlideshowExports,
        isAccessibilityModeEnabled: settings?.enableAccessibilityMode === true,
        exportTemplates,
        slidesTemplateIds,
        onSlidesTemplateIdChange,
    };
}

/**
 * The exact props the default scheduled-email dialog renders its dashboard-attachments field with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @alpha
 */
export function useScheduledEmailDialogDashboardAttachmentsProps(): IScheduledEmailDialogDashboardAttachmentsProps {
    const {
        features: { enableSlideshowExports },
    } = useAutomationsContext();
    const { exportTemplates, dashboardFilters, isCrossFiltering } = useScheduledEmailDialogContext();
    const { selectedAttachments, xlsxSettings, slidesTemplateIds } = useScheduledExportAttachments();
    const { onDashboardAttachmentsChange, onXlsxSettingsChange, onSlidesTemplateIdChange } =
        useScheduledExportActions();

    return {
        selectedAttachments: selectedAttachments.filter((attachment): attachment is DashboardAttachmentType =>
            DASHBOARD_ATTACHMENT_TYPES.has(attachment),
        ),
        dashboardFilters,
        isCrossFiltering,
        onDashboardAttachmentsChange,
        xlsxSettings,
        onXlsxSettingsChange,
        isSlidesExportEnabled: enableSlideshowExports,
        exportTemplates,
        slidesTemplateIds,
        onSlidesTemplateIdChange,
    };
}

/**
 * The exact props the default scheduled-email dialog renders its evaluation-mode checkbox with.
 *
 * Throws outside the scheduled-export dialog's state providers.
 *
 * @alpha
 */
export function useScheduledEmailDialogEvaluationModeProps(): IScheduledEmailDialogEvaluationModeProps {
    const { editedAutomation } = useScheduledExportDraft();
    const { onEvaluationModeChange } = useScheduledExportActions();

    return {
        isShared: editedAutomation.evaluationMode === "SHARED",
        onChange: onEvaluationModeChange,
    };
}
