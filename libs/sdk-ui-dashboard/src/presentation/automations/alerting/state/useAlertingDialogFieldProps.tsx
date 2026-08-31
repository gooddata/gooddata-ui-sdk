// (C) 2026 GoodData Corporation

import { useAlertingDialogContext } from "../../contexts/AlertingDialogContext.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useAlertThreshold } from "../hooks/useAlertThreshold.js";
import {
    type IAlertingDialogAttributeProps,
    type IAlertingDialogComparisonOperatorProps,
    type IAlertingDialogComparisonPeriodProps,
    type IAlertingDialogGranularityProps,
    type IAlertingDialogMeasureProps,
    type IAlertingDialogSensitivityProps,
    type IAlertingDialogThresholdProps,
    type IAlertingDialogTriggerIntervalProps,
    type IAlertingDialogTriggerModeProps,
} from "../types.js";
import { getValueSuffix } from "../utils/getters.js";

import { useAlertActions } from "./AlertActionsContext.js";
import { useAlertData } from "./AlertDataContext.js";
import { useAlertDraft } from "./AlertDraftContext.js";
import { useAlertDialogValidity } from "./useAlertDialogValidity.js";
import { useAlertSelectedValues } from "./useAlertSelectedValues.js";

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

/**
 * The exact props the default alerting dialog renders its measure field with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @alpha
 */
export function useAlertingDialogMeasureProps(): IAlertingDialogMeasureProps {
    const { supportedMeasures } = useAlertData();
    const { onMeasureChange } = useAlertActions();
    const { selectedMeasure } = useAlertSelectedValues();
    const { canChangeMeasure } = useAlertDialogValidity();

    return {
        id: "alert.measure",
        selectedMeasure,
        onMeasureChange,
        measures: supportedMeasures,
        disabled: !canChangeMeasure,
        overlayPositionType: OVERLAY_POSITION_TYPE,
        closeOnParentScroll: CLOSE_ON_PARENT_SCROLL,
    };
}

/**
 * The exact props the default alerting dialog renders its attribute field with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @alpha
 */
export function useAlertingDialogAttributeProps(): IAlertingDialogAttributeProps {
    const { catalogAttributes, catalogDateDatasets } = useAutomationsContext();
    const { supportedAttributes, getAttributeValues, isResultLoading } = useAlertData();
    const { onAttributeChange } = useAlertActions();
    const { selectedAttribute, selectedValue } = useAlertSelectedValues();
    const { canChangeMeasure } = useAlertDialogValidity();

    return {
        id: "alert.attribute",
        disabled: !canChangeMeasure,
        selectedAttribute,
        selectedValue,
        onAttributeChange,
        attributes: supportedAttributes,
        catalogAttributes,
        catalogDateDatasets,
        getAttributeValues,
        isResultLoading,
        showLabel: false,
        closeOnParentScroll: CLOSE_ON_PARENT_SCROLL,
    };
}

/**
 * The exact props the default alerting dialog renders its comparison-operator field with.
 *
 * `enableAnomalyDetectionAlert` is the conjunction of the `enableAnomalyDetectionAlert` and
 * `canUseAiAssistant` features.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @alpha
 */
export function useAlertingDialogComparisonOperatorProps(): IAlertingDialogComparisonOperatorProps {
    const {
        features: { enableAnomalyDetectionAlert, canUseAiAssistant },
    } = useAutomationsContext();
    const { onAnomalyDetectionChange, onComparisonOperatorChange, onRelativeOperatorChange } =
        useAlertActions();
    const { selectedMeasure, selectedComparisonOperator, selectedRelativeOperator, selectedAiOperator } =
        useAlertSelectedValues();

    return {
        id: "alert.condition",
        measure: selectedMeasure,
        enableAnomalyDetectionAlert: enableAnomalyDetectionAlert && canUseAiAssistant,
        selectedComparisonOperator,
        selectedRelativeOperator,
        selectedAiOperator,
        onAnomalyDetectionChange,
        onComparisonOperatorChange,
        onRelativeOperatorChange,
        overlayPositionType: OVERLAY_POSITION_TYPE,
        closeOnParentScroll: CLOSE_ON_PARENT_SCROLL,
    };
}

/**
 * The exact props the default alerting dialog renders its threshold field with.
 *
 * Owns the field's state: its effect auto-computes the threshold of a new alert from the measure's
 * current value and clears it for a relative operator, writing the draft. **Call it once per
 * dialog** — through {@link AlertingDialogThreshold}, which is that mount in the default dialog and
 * in a shell of blocks, or directly, never both. Throws outside the alerting dialog's state
 * providers.
 *
 * @alpha
 */
export function useAlertingDialogThresholdProps(): IAlertingDialogThresholdProps {
    const { alertToEdit } = useAlertingDialogContext();
    const { editedAutomation } = useAlertDraft();
    const { setEditedAutomation } = useAlertActions();
    const { getMetricValue } = useAlertData();
    const { selectedRelativeOperator, selectedMeasure, selectedAttribute, selectedValue } =
        useAlertSelectedValues();

    const { value, onChange, onBlur, thresholdErrorMessage } = useAlertThreshold({
        setEditedAutomation,
        editedAutomation,
        getMetricValue,
        isNewAlert: !alertToEdit,
        selectedRelativeOperator,
        selectedMeasure,
        selectedAttribute,
        selectedValue,
    });

    return {
        id: "alert.value",
        value,
        onChange,
        onBlur,
        suffix: getValueSuffix(editedAutomation?.alert),
        errorMessage: thresholdErrorMessage,
    };
}

/**
 * The exact props the default alerting dialog renders its comparison-period field with.
 *
 * `onComparisonChange` closes over the selected measure (and relative operator), so it takes only
 * the field's value.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @alpha
 */
export function useAlertingDialogComparisonPeriodProps(): IAlertingDialogComparisonPeriodProps {
    const { editedAutomation } = useAlertDraft();
    const { onComparisonTypeChange } = useAlertActions();
    const { selectedMeasure, selectedRelativeOperator, selectedComparator } = useAlertSelectedValues();

    return {
        id: "alert.comparison",
        alert: editedAutomation,
        measure: selectedMeasure,
        selectedComparison: selectedComparator?.comparator,
        selectedGranularity: selectedComparator?.granularity,
        onComparisonChange: (comparisonType, granularity) => {
            onComparisonTypeChange(selectedMeasure, selectedRelativeOperator, comparisonType, granularity);
        },
        overlayPositionType: OVERLAY_POSITION_TYPE,
        closeOnParentScroll: CLOSE_ON_PARENT_SCROLL,
    };
}

/**
 * The exact props the default alerting dialog renders its sensitivity field with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @alpha
 */
export function useAlertingDialogSensitivityProps(): IAlertingDialogSensitivityProps {
    const { onSensitivityChange } = useAlertActions();
    const { selectedSensitivity } = useAlertSelectedValues();

    return {
        id: "alert.sensitivity",
        selectedSensitivity,
        onSensitivityChange,
        overlayPositionType: OVERLAY_POSITION_TYPE,
        closeOnParentScroll: CLOSE_ON_PARENT_SCROLL,
    };
}

/**
 * The exact props the default alerting dialog renders its granularity field with.
 *
 * `onGranularityChange` closes over the selected measure (and relative operator), so it takes only
 * the field's value.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @alpha
 */
export function useAlertingDialogGranularityProps(): IAlertingDialogGranularityProps {
    const { allowHourlyRecurrence } = useAutomationsContext();
    const { onGranularityChange } = useAlertActions();
    const { selectedMeasure, selectedGranularity } = useAlertSelectedValues();

    return {
        id: "alert.granularity",
        allowHourlyRecurrence,
        selectedGranularity,
        onGranularityChange: (granularity) => {
            onGranularityChange(selectedMeasure, granularity);
        },
        overlayPositionType: OVERLAY_POSITION_TYPE,
        closeOnParentScroll: CLOSE_ON_PARENT_SCROLL,
    };
}

/**
 * The exact props the default alerting dialog renders its trigger-mode field with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @alpha
 */
export function useAlertingDialogTriggerModeProps(): IAlertingDialogTriggerModeProps {
    const {
        features: { enableAlertOncePerInterval },
    } = useAutomationsContext();
    const { editedAutomation } = useAlertDraft();
    const { onTriggerModeChange } = useAlertActions();

    return {
        id: "alert.trigger",
        selectedTriggerMode: editedAutomation?.alert?.trigger.mode ?? "ALWAYS",
        onTriggerModeChange,
        overlayPositionType: OVERLAY_POSITION_TYPE,
        closeOnParentScroll: CLOSE_ON_PARENT_SCROLL,
        enableAlertOncePerInterval,
    };
}

/**
 * The exact props the default alerting dialog renders its trigger-interval field with.
 *
 * Throws outside the alerting dialog's state providers.
 *
 * @alpha
 */
export function useAlertingDialogTriggerIntervalProps(): IAlertingDialogTriggerIntervalProps {
    const { editedAutomation } = useAlertDraft();
    const { onTriggerIntervalChange } = useAlertActions();

    return {
        id: "alert.interval",
        selectedTriggerInterval: editedAutomation?.alert?.trigger.interval ?? "DAY",
        onTriggerIntervalChange,
        overlayPositionType: OVERLAY_POSITION_TYPE,
        closeOnParentScroll: CLOSE_ON_PARENT_SCROLL,
    };
}
