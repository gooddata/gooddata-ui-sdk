// (C) 2026 GoodData Corporation

import { type Dispatch, type SetStateAction } from "react";

import {
    type DateAttributeGranularity,
    type FilterContextItem,
    type IAlertAnomalyDetectionGranularity,
    type IAlertAnomalyDetectionSensitivity,
    type IAlertComparisonOperator,
    type IAlertRelativeArithmeticOperator,
    type IAlertRelativeOperator,
    type IAlertTriggerInterval,
    type IAlertTriggerMode,
    type IAttribute,
    type IAttributeMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IAutomationRecipient,
    type IMeasure,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IdentifierRef,
    type ParameterValue,
} from "@gooddata/sdk-model";

import { type IAutomationParameter } from "../../shared/automationFilters/automationParameters.js";
import { type AttributeValue } from "../hooks/useAttributeValuesFromExecResults.js";
import {
    type AlertAttribute,
    type AlertMetric,
    type AlertMetricComparator,
    type AlertMetricComparatorType,
    type IAlertingDialogProps,
} from "../types.js";
import { type AlertAiOperator, type IMeasureFormatMap } from "../utils/getters.js";

/**
 * The alerting dialog's edit draft: the automation being edited, the baseline it is compared
 * against, and the form-level warning and title-validity flag that move with it.
 *
 * Changes on every keystroke; consumers re-render by design.
 *
 * @alpha
 */
export interface IAlertDraftContextValue {
    /**
     * The alert being edited. Undefined only before the state model has seeded it.
     */
    editedAutomation: IAutomationMetadataObjectDefinition | undefined;

    /**
     * The draft as it was when the dialog opened; the dirty check compares against it.
     */
    originalAutomation: IAutomationMetadataObjectDefinition | undefined;

    /**
     * Form-level warning shown below the form, e.g. after switching to a creator-only channel.
     */
    warningMessage: string | undefined;

    /**
     * Whether the current title passes the length limit.
     */
    isTitleValid: boolean;
}

/**
 * The alerting dialog's mutators: the draft setter and every form change-handler.
 *
 * Changes rarely: `onGranularityChange` is re-created when `triggerIntervalDirty` toggles or the
 * supported measures load.
 *
 * @alpha
 */
export interface IAlertActionsContextValue {
    /**
     * Replaces the draft; the change-handlers below are the preferred, field-scoped writes.
     */
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition | undefined>>;
    /**
     * Sets the alert title and re-validates its length.
     */
    onTitleChange: (value: string) => void;
    /**
     * Selects the measure the condition targets; resets the comparison to the measure's defaults.
     */
    onMeasureChange: (measure: AlertMetric) => void;
    /**
     * Slices the condition by an attribute value; `undefined` clears the slice.
     */
    onAttributeChange: (attribute: AlertAttribute | undefined, value: AttributeValue | undefined) => void;
    /**
     * Switches the condition to a comparison against a fixed threshold.
     */
    onComparisonOperatorChange: (measure: AlertMetric, comparisonOperator: IAlertComparisonOperator) => void;
    /**
     * Switches the condition to a relative (change / difference) comparison with the given operators.
     */
    onRelativeOperatorChange: (
        measure: AlertMetric,
        relativeOperator: IAlertRelativeOperator,
        arithmeticOperator: IAlertRelativeArithmeticOperator,
    ) => void;
    /**
     * Switches the condition to anomaly detection on the measure.
     */
    onAnomalyDetectionChange: (measure: AlertMetric) => void;
    /**
     * Sets the period a relative condition compares against (and its granularity when given).
     */
    onComparisonTypeChange: (
        measure: AlertMetric | undefined,
        relativeOperator: [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined,
        comparisonType: AlertMetricComparatorType,
        granularity?: DateAttributeGranularity,
    ) => void;
    /**
     * Sets the anomaly-detection sensitivity.
     */
    onSensitivityChange: (sensitivity: IAlertAnomalyDetectionSensitivity) => void;
    /**
     * Sets the trigger interval. `dirty` defaults to true; the granularity handler passes false when it
     * derives the interval.
     */
    onTriggerIntervalChange: (triggerInterval: IAlertTriggerInterval, dirty?: boolean) => void;
    /**
     * Sets the anomaly-detection granularity; derives the trigger interval unless the user edited it.
     */
    onGranularityChange: (
        measure: AlertMetric | undefined,
        granularity: IAlertAnomalyDetectionGranularity,
    ) => void;
    /**
     * Selects the notification channel; recipients incompatible with it are dropped.
     */
    onDestinationChange: (destinationId: string) => void;
    /**
     * Sets when the alert fires: every evaluation or once per interval.
     */
    onTriggerModeChange: (triggerMode: IAlertTriggerMode) => void;
    /**
     * Replaces the recipients with the complete updated array.
     */
    onRecipientsChange: (recipients: IAutomationRecipient[]) => void;
}

/**
 * The data the alerting dialog loads asynchronously: the supported measures and attributes with
 * their formats, the execution-result readers, and the current user's default recipients.
 *
 * Changes when an async load resolves, not per keystroke.
 *
 * @alpha
 */
export interface IAlertDataContextValue {
    /**
     * Measures of the insight an alert can be built on, with their comparisons.
     */
    supportedMeasures: AlertMetric[];
    /**
     * Attributes of the insight an alert can be sliced by.
     */
    supportedAttributes: AlertAttribute[];
    /**
     * Number formats of the insight's measures, by local identifier.
     */
    measureFormatMap: IMeasureFormatMap;
    /**
     * Whether the widget's execution result is still loading.
     */
    isResultLoading: boolean;
    /**
     * Distinct values of an attribute in the widget's execution result.
     */
    getAttributeValues: (attribute: IAttributeMetadataObject) => AttributeValue[];
    /**
     * The measure's current value, optionally sliced by an attribute value; undefined while loading.
     */
    getMetricValue: (measure?: IMeasure, attribute?: IAttribute, value?: string | null) => number | undefined;
    /**
     * The logged-in user as a recipient.
     */
    defaultUser: IAutomationRecipient;
    /**
     * The recipient a new alert is seeded with; an external-recipient override replaces the user.
     */
    defaultRecipient: IAutomationRecipient;
}

/**
 * The alerting dialog's filter and export-parameter model: the current selection, the available
 * filters, the two filter mutators and the staleness flags, plus the automation's execution
 * parameters and their mutators.
 *
 * Changes when a filter or a parameter is edited.
 *
 * @alpha
 */
export interface IAlertFiltersContextValue {
    /**
     * The filters the alert is saved with.
     */
    selectedFilters: FilterContextItem[];
    /**
     * The dashboard filters the alert may use; undefined until resolved.
     */
    availableFilters: FilterContextItem[] | undefined;
    /**
     * Replaces the selection with the complete updated array and mirrors it into the draft.
     */
    onFiltersChange: (filters: FilterContextItem[]) => void;
    /**
     * Replaces the selection with the dashboard's current filters (the stale-filters repair).
     */
    onApplyCurrentFilters: () => void;
    /**
     * False when the saved filters or the saved parameters no longer match the dashboard; gates the
     * stale-filters confirmation.
     */
    automationIsValid: boolean;
    /**
     * Whether the saved filters alone no longer match the dashboard.
     */
    filtersAreStale: boolean;
    /**
     * The parameter chips to render. Empty when the `enableParameters` feature is off.
     */
    automationParameters: IAutomationParameter[];
    /**
     * Workspace parameters addable via the "+" menu. Empty when the feature is off.
     */
    availableParameters: IAutomationParameter[];
    /**
     * Sets a parameter's value.
     */
    onParameterChange: (ref: IdentifierRef, value: ParameterValue) => void;
    /**
     * Removes a parameter override.
     */
    onParameterDelete: (ref: IdentifierRef) => void;
    /**
     * Adds a workspace parameter with its default value.
     */
    onParameterAdd: (ref: IdentifierRef) => void;
    /**
     * Drops stored parameters whose `ref` left the workspace catalog, keeping every other override.
     */
    dropStaleParameters: () => void;
}

/**
 * Return type of `useAlertFormState`, composed from the context values it feeds.
 *
 * @internal
 */
export type IAlertFormState = IAlertDraftContextValue &
    IAlertActionsContextValue &
    Pick<IAlertDataContextValue, "defaultUser" | "defaultRecipient"> &
    Pick<
        IAlertFiltersContextValue,
        | "automationParameters"
        | "availableParameters"
        | "onParameterChange"
        | "onParameterDelete"
        | "onParameterAdd"
        | "dropStaleParameters"
    >;

/**
 * Return type of `useAlertSupportedMetrics`.
 *
 * @internal
 */
export type IAlertSupportedMetrics = Pick<
    IAlertDataContextValue,
    | "supportedMeasures"
    | "supportedAttributes"
    | "measureFormatMap"
    | "isResultLoading"
    | "getAttributeValues"
    | "getMetricValue"
>;

/**
 * Return type of `useAlertFiltersModel`.
 *
 * @internal
 */
export type IAlertFiltersModel = Pick<
    IAlertFiltersContextValue,
    | "selectedFilters"
    | "availableFilters"
    | "onFiltersChange"
    | "onApplyCurrentFilters"
    | "automationIsValid"
    | "filtersAreStale"
>;

/**
 * The alerting dialog's currently selected form values, derived from the draft and the supported
 * measures and attributes.
 *
 * @alpha
 */
export interface IAlertSelectedValues {
    /**
     * The measure the condition targets; undefined until the draft names one the insight supports.
     */
    selectedMeasure: AlertMetric | undefined;
    /**
     * The operator of a fixed-threshold comparison condition.
     */
    selectedComparisonOperator: IAlertComparisonOperator | undefined;
    /**
     * The relative and arithmetic operators of a relative condition.
     */
    selectedRelativeOperator: [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined;
    /**
     * The operator id of an anomaly-detection condition.
     */
    selectedAiOperator: AlertAiOperator | undefined;
    /**
     * The period comparison a relative condition uses.
     */
    selectedComparator: AlertMetricComparator | undefined;
    /**
     * The sensitivity of an anomaly-detection condition.
     */
    selectedSensitivity: IAlertAnomalyDetectionSensitivity | undefined;
    /**
     * The granularity of an anomaly-detection condition.
     */
    selectedGranularity: IAlertAnomalyDetectionGranularity | undefined;
    /**
     * The attribute the condition is sliced by.
     */
    selectedAttribute: AlertAttribute | undefined;
    /**
     * The attribute element URI the condition is sliced to; null for the empty value.
     */
    selectedValue: string | null | undefined;
    /**
     * The notification channel the draft targets, resolved against the available channels.
     */
    selectedNotificationChannel:
        | INotificationChannelIdentifier
        | INotificationChannelMetadataObject
        | undefined;
    /**
     * Whether the selected channel accepts external (e-mail only) recipients.
     */
    allowExternalRecipients: boolean;
    /**
     * Whether the selected channel accepts only the creator as recipient.
     */
    allowOnlyLoggedUserRecipients: boolean;
}

/**
 * The alerting dialog's validity.
 *
 * @alpha
 */
export interface IAlertDialogValidity {
    /**
     * Whether submit is disabled: the draft is invalid, incomplete, or unchanged in edit mode.
     */
    isSubmitDisabled: boolean;
    /**
     * The validation message to show; undefined when there is none.
     */
    validationErrorMessage: string | undefined;
    /**
     * Whether the widget the alert is attached to still exists and supports the alert's measure.
     */
    isParentValid: boolean;
    /**
     * Whether the measure may be changed — false when the dialog has no insight.
     */
    canChangeMeasure: boolean;
    /**
     * Whether the saved alert points at a widget whose insight is gone.
     */
    isInvalidConnectionToInsight: boolean;
}

/**
 * Lifecycle callbacks of {@link useAlertSubmit}: the dialog's own `onSuccess`/`onError` (create) and
 * `onSaveSuccess`/`onSaveError` (edit).
 *
 * @alpha
 */
export type IUseAlertSubmitCallbacks = Pick<
    IAlertingDialogProps,
    "onSuccess" | "onError" | "onSaveSuccess" | "onSaveError"
>;

/**
 * The alerting dialog's submit path.
 *
 * @alpha
 */
export interface IAlertSubmitState {
    /**
     * Whether a create or save is in flight.
     */
    isSaving: boolean;
    /**
     * Creates the alert (no `alertToEdit`) or saves the edited one; a second call while one is in
     * flight is ignored.
     */
    submit: () => Promise<void>;
}
