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
    type IdentifierRef,
    type ParameterValue,
} from "@gooddata/sdk-model";

import { type IAutomationParameter } from "../../shared/automationFilters/automationParameters.js";
import { type AttributeValue } from "../DefaultAlertingDialog/hooks/useAttributeValuesFromExecResults.js";
import { type IMeasureFormatMap } from "../DefaultAlertingDialog/utils/getters.js";
import { type AlertAttribute, type AlertMetric, type AlertMetricComparatorType } from "../types.js";

/**
 * The alerting dialog's edit draft: the automation being edited, the baseline it is compared
 * against, and the form-level warning and title-validity flag that move with it.
 *
 * Changes on every keystroke; consumers re-render by design.
 *
 * @internal
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
 * @internal
 */
export interface IAlertActionsContextValue {
    setEditedAutomation: Dispatch<SetStateAction<IAutomationMetadataObjectDefinition | undefined>>;
    onTitleChange: (value: string) => void;
    onMeasureChange: (measure: AlertMetric) => void;
    onAttributeChange: (attribute: AlertAttribute | undefined, value: AttributeValue | undefined) => void;
    onComparisonOperatorChange: (measure: AlertMetric, comparisonOperator: IAlertComparisonOperator) => void;
    onRelativeOperatorChange: (
        measure: AlertMetric,
        relativeOperator: IAlertRelativeOperator,
        arithmeticOperator: IAlertRelativeArithmeticOperator,
    ) => void;
    onAnomalyDetectionChange: (measure: AlertMetric) => void;
    onComparisonTypeChange: (
        measure: AlertMetric | undefined,
        relativeOperator: [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined,
        comparisonType: AlertMetricComparatorType,
        granularity?: DateAttributeGranularity,
    ) => void;
    onSensitivityChange: (sensitivity: IAlertAnomalyDetectionSensitivity) => void;
    /**
     * `dirty` defaults to true; the granularity handler passes false when it derives the interval.
     */
    onTriggerIntervalChange: (triggerInterval: IAlertTriggerInterval, dirty?: boolean) => void;
    onGranularityChange: (
        measure: AlertMetric | undefined,
        granularity: IAlertAnomalyDetectionGranularity,
    ) => void;
    onDestinationChange: (destinationId: string) => void;
    onTriggerModeChange: (triggerMode: IAlertTriggerMode) => void;
    onRecipientsChange: (recipients: IAutomationRecipient[]) => void;
}

/**
 * The data the alerting dialog loads asynchronously: the supported measures and attributes with
 * their formats, the execution-result readers, and the current user's default recipients.
 *
 * Changes when an async load resolves, not per keystroke.
 *
 * @internal
 */
export interface IAlertDataContextValue {
    supportedMeasures: AlertMetric[];
    supportedAttributes: AlertAttribute[];
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
 * @internal
 */
export interface IAlertFiltersContextValue {
    selectedFilters: FilterContextItem[];
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
    onParameterChange: (ref: IdentifierRef, value: ParameterValue) => void;
    onParameterDelete: (ref: IdentifierRef) => void;
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
