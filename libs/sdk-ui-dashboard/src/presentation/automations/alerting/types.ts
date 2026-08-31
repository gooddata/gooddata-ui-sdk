// (C) 2019-2026 GoodData Corporation

import { type ComponentType, type FocusEvent, type ReactNode, type Ref } from "react";

import {
    type DateAttributeGranularity,
    type IAlertAnomalyDetectionGranularity,
    type IAlertAnomalyDetectionSensitivity,
    type IAlertComparisonOperator,
    type IAlertRelativeArithmeticOperator,
    type IAlertRelativeOperator,
    type IAlertTriggerInterval,
    type IAlertTriggerMode,
    type IAttribute,
    type IAttributeMetadataObject,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type IDataSetMetadataObject,
    type IInsight,
    type IMeasure,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";
import type { AI_OPERATOR, AI_OPERATORS } from "@gooddata/sdk-ui-ext";
import { type ISlotProps, type OverlayPositionType } from "@gooddata/sdk-ui-kit";

import {
    type IAutomationDialogActionBarProps,
    type IAutomationDialogDestinationProps,
    type IAutomationDialogFiltersProps,
    type IAutomationDialogHeaderProps,
    type IAutomationDialogRecipientsProps,
} from "../shared/slots/types.js";

import { type AttributeValue } from "./hooks/useAttributeValuesFromExecResults.js";

///
/// Component props
///

/**
 * @alpha
 */
export interface IAlertingDialogProps {
    /**
     * In case, we are not creating new alert, but editing existing one, this is the active alert to be edited.
     *
     * @deprecated has no effect since 11.51 — the dialog reads `alertToEdit` from
     *     `useAlertingDialogContext()`. To adjust what it reads, use the
     *     `AlertingDialogContextDecoratorComponent` dashboard prop. Prop will be removed.
     */
    alertToEdit?: IAutomationMetadataObject;

    /**
     * Notification channels in organization
     *
     * @deprecated has no effect since 11.51 — the dialog reads `notificationChannels` from
     *     `useAlertingDialogContext()`. To adjust what it reads, use the
     *     `AlertingDialogContextDecoratorComponent` dashboard prop. Prop will be removed.
     */
    notificationChannels?: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Widget to be used for alert.
     *
     * Note: this is available only when alerting for widget, not dashboard.
     * Typed as IWidget (not ExtendedDashboardWidget) because the dialog only
     * supports insight widgets; custom widgets and nested layouts are not valid
     * alert targets and were silently discarded at the connector boundary anyway.
     *
     * @deprecated has no effect since 11.51 — the dialog reads `widget` from
     *     `useAlertingDialogContext()`. To adjust what it reads, use the
     *     `AlertingDialogContextDecoratorComponent` dashboard prop. Prop will be removed.
     */
    widget?: IWidget;

    /**
     * Insight to be used for alert.
     *
     * Note: this is available only when alerting for widget, not dashboard.
     *
     * @deprecated has no effect since 11.51 — the dialog reads `insight` from
     *     `useAlertingDialogContext()`. To adjust what it reads, use the
     *     `AlertingDialogContextDecoratorComponent` dashboard prop (e.g. so an alert follows a
     *     widget's date-granularity selection). Prop will be removed.
     */
    insight?: IInsight;

    /**
     * Is alert dialog loading initial data, before it can be rendered?
     *
     * @deprecated has no effect since 11.51 — the dialog reads `isLoading` from
     *     `useAlertingDialogContext()`. Prop will be removed.
     */
    isLoading?: boolean;

    /**
     * Callback to be called, when user closes the alert dialog.
     */
    onCancel?: () => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when alerting finishes successfully.
     */
    onSuccess?: (alertDefinition: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when error occurs.
     */
    onSaveError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when alerting finishes successfully.
     */
    onSaveSuccess?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when alert is deleted.
     */
    onDeleteSuccess?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when alert fails to delete.
     */
    onDeleteError?: (error: GoodDataSdkError) => void;
}

/**
 * Props of the default alerting dialog's header region (the title input row).
 *
 * @alpha
 */
export interface IAlertingDialogHeaderProps extends IAutomationDialogHeaderProps {
    /**
     * Called when the header's back/close button is pressed. The default dialog closes on it.
     */
    onCancel?: () => void;
}

/**
 * The exact props the default dialog renders its header with, including the dialog's
 * initial-focus ref.
 *
 * @alpha
 */
export type AlertingDialogHeaderDefaultProps = IAlertingDialogHeaderProps & {
    ref?: Ref<HTMLInputElement>;
};

/**
 * Props of the default alerting dialog's filters region (the filter and parameter chips above
 * the form).
 *
 * @alpha
 */
export interface IAlertingDialogFiltersProps extends IAutomationDialogFiltersProps {
    /**
     * Disables the date filter chips. The default dialog disables them while the alert uses
     * anomaly detection.
     */
    disableDateFilters: boolean;
}

/**
 * Props of the default alerting dialog's measure field (the "Metric" row).
 *
 * @alpha
 */
export interface IAlertingDialogMeasureProps {
    /**
     * Id of the dropdown button; the form row's label points at it.
     */
    id?: string;
    /**
     * Disables the select. The default dialog disables it when the dialog has no insight to pick measures from.
     */
    disabled?: boolean;
    /**
     * The measure the condition targets; undefined shows the placeholder.
     */
    selectedMeasure: AlertMetric | undefined;
    /**
     * Called with the picked measure.
     */
    onMeasureChange: (measure: AlertMetric) => void;
    /**
     * The insight's measures an alert can be built on.
     */
    measures: AlertMetric[];
    /**
     * Positioning of the dropdown overlay; the default dialog uses `"sameAsTarget"`.
     */
    overlayPositionType?: OverlayPositionType;
    /**
     * Closes the dropdown when an ancestor scrolls; the default dialog sets it.
     */
    closeOnParentScroll?: boolean;
}

/**
 * Props of the default alerting dialog's attribute field (the "For" row).
 *
 * @alpha
 */
export interface IAlertingDialogAttributeProps {
    /**
     * Id of the dropdown button; the form row's label points at it.
     */
    id: string;
    /**
     * Disables the select. The default dialog disables it when the dialog has no insight to pick measures from.
     */
    disabled?: boolean;
    /**
     * The attribute the condition is sliced by; undefined for the whole measure.
     */
    selectedAttribute: AlertAttribute | undefined;
    /**
     * The attribute element the condition is sliced to; null for the empty value, undefined for all values.
     */
    selectedValue: string | null | undefined;
    /**
     * Called with the picked attribute and value; `(undefined, undefined)` clears the slice.
     */
    onAttributeChange: (attribute: AlertAttribute | undefined, value: AttributeValue | undefined) => void;
    /**
     * The insight's attributes; the select offers the non-date ones and renders nothing when there is none.
     */
    attributes: AlertAttribute[];
    /**
     * The workspace catalog's attributes, to resolve titles and display forms.
     */
    catalogAttributes: ICatalogAttribute[];
    /**
     * The workspace catalog's date datasets, to resolve date attributes.
     */
    catalogDateDatasets: ICatalogDateDataset[];
    /**
     * Distinct values of an attribute in the widget's execution result.
     */
    getAttributeValues: (attribute: IAttributeMetadataObject) => AttributeValue[];
    /**
     * Disables the select while the execution result is loading.
     */
    isResultLoading?: boolean;
    /**
     * Renders the select's own "For" label above the control. The default dialog passes false — the
     * form row carries the label.
     */
    showLabel?: boolean;
    /**
     * Closes the dropdown when an ancestor scrolls; the default dialog sets it.
     */
    closeOnParentScroll?: boolean;
}

/**
 * Props of the default alerting dialog's comparison-operator field (the "Condition" row).
 *
 * @alpha
 */
export interface IAlertingDialogComparisonOperatorProps {
    /**
     * Id of the dropdown button; the form row's label points at it.
     */
    id: string;
    /**
     * The measure the condition targets; the select renders nothing without one.
     */
    measure: AlertMetric | undefined;
    /**
     * Offers the anomaly-detection operators. The default dialog passes the conjunction of the
     * `enableAnomalyDetectionAlert` and `canUseAiAssistant` features; pass false to hide those
     * options.
     */
    enableAnomalyDetectionAlert: boolean;
    /**
     * The operator of a fixed-threshold condition, when that is the condition type.
     */
    selectedComparisonOperator: IAlertComparisonOperator | undefined;
    /**
     * The relative and arithmetic operators of a relative condition, when that is the condition type.
     */
    selectedRelativeOperator: [IAlertRelativeOperator, IAlertRelativeArithmeticOperator] | undefined;
    /**
     * The operator id of an anomaly-detection condition, when that is the condition type.
     */
    selectedAiOperator: AlertAiOperator | undefined;
    /**
     * Called when a fixed-threshold operator is picked.
     */
    onComparisonOperatorChange: (measure: AlertMetric, comparisonOperator: IAlertComparisonOperator) => void;
    /**
     * Called when the anomaly-detection operator is picked.
     */
    onAnomalyDetectionChange: (measure: AlertMetric) => void;
    /**
     * Called when a relative (change / difference) operator is picked.
     */
    onRelativeOperatorChange: (
        measure: AlertMetric,
        relativeOperator: IAlertRelativeOperator,
        arithmeticOperator: IAlertRelativeArithmeticOperator,
    ) => void;
    /**
     * Positioning of the dropdown overlay; the default dialog uses `"sameAsTarget"`.
     */
    overlayPositionType?: OverlayPositionType;
    /**
     * Closes the dropdown when an ancestor scrolls; the default dialog sets it.
     */
    closeOnParentScroll?: boolean;
}

/**
 * Props of the default alerting dialog's threshold field (the "Threshold" row).
 *
 * @alpha
 */
export interface IAlertingDialogThresholdProps {
    /**
     * Id of the input; the form row's label and the error message point at it.
     */
    id: string;
    /**
     * The threshold shown; undefined for an empty input.
     */
    value: number | undefined;
    /**
     * Called with the raw input value on every keystroke.
     */
    onChange: (value: string | number) => void;
    /**
     * Called on blur; the default dialog rounds the value to the measure's format here.
     */
    onBlur: (event: FocusEvent<HTMLInputElement>) => void;
    /**
     * Unit shown after the input — `"%"` for a change condition.
     */
    suffix?: string;
    /**
     * Validation message shown under the input; undefined when there is none.
     */
    errorMessage?: string;
}

/**
 * Props of the default alerting dialog's comparison-period field (the "Compared to" row).
 *
 * @alpha
 */
export interface IAlertingDialogComparisonPeriodProps {
    /**
     * Id of the dropdown button; the form row's label points at it.
     */
    id: string;
    /**
     * The alert draft; the select renders nothing unless its condition is a change or difference.
     */
    alert: IAutomationMetadataObjectDefinition | undefined;
    /**
     * The measure the condition targets, whose comparators are the options; with a single
     * comparator the select renders it as static text.
     */
    measure: AlertMetric | undefined;
    /**
     * The selected period comparison.
     */
    selectedComparison?: AlertMetricComparatorType;
    /**
     * The selected granularity of the period shift.
     */
    selectedGranularity?: DateAttributeGranularity;
    /**
     * Called with the picked comparison and its granularity.
     */
    onComparisonChange: (
        comparison: AlertMetricComparatorType,
        granularity?: DateAttributeGranularity,
    ) => void;
    /**
     * Positioning of the dropdown overlay; the default dialog uses `"sameAsTarget"`.
     */
    overlayPositionType?: OverlayPositionType;
    /**
     * Closes the dropdown when an ancestor scrolls; the default dialog sets it.
     */
    closeOnParentScroll?: boolean;
}

/**
 * Props of the default alerting dialog's sensitivity field (anomaly detection).
 *
 * @alpha
 */
export interface IAlertingDialogSensitivityProps {
    /**
     * Id of the dropdown button; the form row's label points at it.
     */
    id: string;
    /**
     * The anomaly-detection sensitivity; undefined renders as `"MEDIUM"`.
     */
    selectedSensitivity: IAlertAnomalyDetectionSensitivity | undefined;
    /**
     * Called with the picked sensitivity.
     */
    onSensitivityChange: (sensitivity: IAlertAnomalyDetectionSensitivity) => void;
    /**
     * Positioning of the dropdown overlay; the default dialog uses `"sameAsTarget"`.
     */
    overlayPositionType?: OverlayPositionType;
    /**
     * Closes the dropdown when an ancestor scrolls; the default dialog sets it.
     */
    closeOnParentScroll?: boolean;
}

/**
 * Props of the default alerting dialog's granularity field (anomaly detection).
 *
 * @alpha
 */
export interface IAlertingDialogGranularityProps {
    /**
     * Id of the dropdown button; the form row's label points at it.
     */
    id: string;
    /**
     * Offers the `"HOUR"` granularity.
     */
    allowHourlyRecurrence: boolean;
    /**
     * The anomaly-detection granularity; undefined renders as `"WEEK"`.
     */
    selectedGranularity: IAlertAnomalyDetectionGranularity | undefined;
    /**
     * Called with the picked granularity.
     */
    onGranularityChange: (granularity: IAlertAnomalyDetectionGranularity) => void;
    /**
     * Positioning of the dropdown overlay; the default dialog uses `"sameAsTarget"`.
     */
    overlayPositionType?: OverlayPositionType;
    /**
     * Closes the dropdown when an ancestor scrolls; the default dialog sets it.
     */
    closeOnParentScroll?: boolean;
}

/**
 * Props of the default alerting dialog's trigger-mode field (the "Trigger" row).
 *
 * @alpha
 */
export interface IAlertingDialogTriggerModeProps {
    /**
     * Id of the dropdown button; the form row's label points at it.
     */
    id: string;
    /**
     * When the alert fires: `"ALWAYS"`, `"ONCE"` or `"ONCE_PER_INTERVAL"`.
     */
    selectedTriggerMode: IAlertTriggerMode;
    /**
     * Called with the picked mode.
     */
    onTriggerModeChange: (triggerMode: IAlertTriggerMode) => void;
    /**
     * Positioning of the dropdown overlay; the default dialog uses `"sameAsTarget"`.
     */
    overlayPositionType?: OverlayPositionType;
    /**
     * Closes the dropdown when an ancestor scrolls; the default dialog sets it.
     */
    closeOnParentScroll?: boolean;
    /**
     * Offers `"ONCE_PER_INTERVAL"`; the default dialog passes the feature flag.
     */
    enableAlertOncePerInterval?: boolean;
}

/**
 * Props of the default alerting dialog's trigger-interval field (the "Interval" row).
 *
 * @alpha
 */
export interface IAlertingDialogTriggerIntervalProps {
    /**
     * Id of the dropdown button; the form row's label points at it.
     */
    id: string;
    /**
     * The interval of a `"ONCE_PER_INTERVAL"` trigger.
     */
    selectedTriggerInterval: IAlertTriggerInterval;
    /**
     * Called with the picked interval.
     */
    onTriggerIntervalChange: (triggerInterval: IAlertTriggerInterval) => void;
    /**
     * Positioning of the dropdown overlay; the default dialog uses `"sameAsTarget"`.
     */
    overlayPositionType?: OverlayPositionType;
    /**
     * Closes the dropdown when an ancestor scrolls; the default dialog sets it.
     */
    closeOnParentScroll?: boolean;
}

/**
 * Section-level overrides of the default alerting dialog.
 *
 * @alpha
 */
export interface IAlertingDialogSlots {
    /**
     * Wraps or replaces the dialog header (the title input row). Must have a stable reference
     * identity — see {@link @gooddata/sdk-ui-kit#ISlotProps}.
     */
    Header?: ComponentType<ISlotProps<AlertingDialogHeaderDefaultProps>>;

    /**
     * Wraps or replaces the dialog's filters region (the filter and parameter chips). Must have
     * a stable reference identity — see {@link @gooddata/sdk-ui-kit#ISlotProps}.
     *
     * Renders only in the fully rendered dialog: not while the dialog context reports loading,
     * and not while the stale-filters confirmation step is shown.
     *
     * A replacement takes over computing the next filters array: `defaultProps.onFiltersChange`
     * expects the complete selection, so change/remove/add gestures must submit the whole
     * updated array, not a delta.
     */
    Filters?: ComponentType<ISlotProps<IAlertingDialogFiltersProps>>;

    /**
     * Wraps or replaces the dialog's destination region (the "Action" row selecting the
     * notification channel). Must have a stable reference identity — see {@link @gooddata/sdk-ui-kit#ISlotProps}.
     *
     * Renders only in the fully rendered dialog — not while the dialog context reports loading,
     * not while the stale-filters confirmation step is shown — **and only when more than one
     * notification channel exists**: with a single channel the default dialog hides the whole
     * row, and the slot with it.
     */
    Destination?: ComponentType<ISlotProps<IAutomationDialogDestinationProps>>;

    /**
     * Wraps or replaces the dialog's recipients region. Must have a stable reference identity —
     * see {@link @gooddata/sdk-ui-kit#ISlotProps}.
     *
     * Renders only in the fully rendered dialog: not while the dialog context reports loading,
     * and not while the stale-filters confirmation step is shown.
     */
    Recipients?: ComponentType<ISlotProps<IAutomationDialogRecipientsProps>>;

    /**
     * Wraps or replaces the dialog's action bar (the footer row: documentation link, Delete in
     * edit mode, Cancel and the submit button). Must have a stable reference identity — see
     * {@link @gooddata/sdk-ui-kit#ISlotProps}.
     *
     * Renders only in the fully rendered dialog: not while the dialog context reports loading
     * (the loading dialog keeps its own footer), and not while the stale-filters confirmation
     * step is shown.
     *
     * A replacement that does not render `Default` loses the submit button's Enter-key detection
     * id (Enter no longer submits), the validation aria wiring, and the default row's ordering.
     * Wraps that render `<Default {...defaultProps} />` keep everything; note the Enter-key path
     * invokes the dialog's own submit handler and disabled state, so `defaultProps` overrides
     * affect the buttons only.
     */
    ActionBar?: ComponentType<ISlotProps<IAutomationDialogActionBarProps>>;
}

/**
 * Props of {@link DefaultAlertingDialog}.
 *
 * @remarks
 * Extends the shared {@link IAlertingDialogProps} with customization only the default implementation
 * supports. Slots render only in the fully rendered dialog: not while the dialog context reports
 * loading, and not while the stale-filters confirmation step is shown. The Destination slot
 * additionally renders only when more than one notification channel exists — see
 * {@link IAlertingDialogSlots.Destination}.
 *
 * @alpha
 */
export interface IDefaultAlertingDialogProps extends IAlertingDialogProps {
    /**
     * Section-level overrides. Each slot receives `{ Default, defaultProps }` — `Default` is the region's
     * exported render component ({@link DefaultAlertingDialogHeader} for `Header`, and so on) and `defaultProps` the
     * return of the region's props hook ({@link useAlertingDialogHeaderProps}) — and may render its own content
     * (replace) or `<Default {...defaultProps} />` inside its own markup (wrap).
     *
     * @example
     * The dialog is reached through the `Dashboard` component override; define slot components at
     * module scope (see {@link @gooddata/sdk-ui-kit#ISlotProps}):
     * ```tsx
     * function HeaderWithBanner({ Default, defaultProps }: ISlotProps<AlertingDialogHeaderDefaultProps>) {
     *     return (
     *         <>
     *             <WarningBanner>Alerts may take up to 5 minutes.</WarningBanner>
     *             <Default {...defaultProps} />
     *         </>
     *     );
     * }
     *
     * <Dashboard
     *     AlertingDialogComponent={(props) => (
     *         <DefaultAlertingDialog {...props} slots={{ Header: HeaderWithBanner }} />
     *     )}
     * />;
     * ```
     */
    slots?: IAlertingDialogSlots;

    /**
     * Content rendered as the first child of the dialog's scrollable content area, above the
     * form. Rendered only in the fully rendered dialog: not while the dialog context reports
     * loading, and not while the stale-filters confirmation step is shown.
     */
    topContent?: ReactNode;

    /**
     * Content rendered as the last child of the dialog's scrollable content area, below the
     * form. Same rendering conditions as {@link IDefaultAlertingDialogProps.topContent}.
     */
    bottomContent?: ReactNode;
}

/**
 * @alpha
 */
export interface IAlertingManagementDialogProps {
    /**
     * Is loading alert data?
     *
     * @deprecated not read by the default dialog. Prop will be removed.
     */
    isLoadingAlertingData?: boolean;

    /**
     * Error occurred while loading alert data?
     *
     * @deprecated not read by the default dialog. Prop will be removed.
     */
    alertDataError?: GoodDataSdkError;

    /**
     * Notification channels in organization
     *
     * @deprecated not read by the default dialog. A replacement can read the dashboard's
     *     notification channels directly. Prop will be removed.
     */
    notificationChannels?: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];

    /**
     * Automations in workspace
     *
     * @deprecated not read by the default dialog. A replacement can read the dashboard's
     *     automations directly. Prop will be removed.
     */
    automations?: IAutomationMetadataObject[];

    /**
     * Callback to be called, when user adds new alert item.
     */
    onAdd?: () => void;

    /**
     * Callback to be called, when user clicks alert item for editing.
     */
    onEdit?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when user closes the alert management dialog.
     */
    onClose?: () => void;

    /**
     * Callback to be called, when alert is deleted.
     * @param alert - alert that was deleted
     */
    onDeleteSuccess?: (alert: IAutomationMetadataObject) => void;

    /**
     * Callback to be called, when alert fails to delete.
     */
    onDeleteError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when alert is paused.
     * @param alert - alert that was paused
     * @param pause - true if alert was paused, false if it was resumed
     */
    onPauseSuccess: (alert: IAutomationMetadataObject, pause: boolean) => void;

    /**
     * Callback to be called, when alert fails to pause.
     * @param error - error that occurred
     * @param pause - true if alert was paused, false if it was resumed
     */
    onPauseError: (error: GoodDataSdkError, pause: boolean) => void;
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomAlertingDialogComponent = ComponentType<IAlertingDialogProps>;

/**
 * Decorates the data the alerting create/edit dialog reads.
 *
 * The dashboard mounts this component between the connector-provided dialog context and the
 * dialog's state model, so the value it re-provides is what both the default dialog and the
 * state seeding read — a wholesale `AlertingDialogComponent` replacement sees it too. Read the
 * current value with `useAlertingDialogContext()`, decorate the members to adjust, and
 * re-provide via `AlertingDialogContextProvider`:
 *
 * @example
 * ```tsx
 * function InsightDecorator({ children }: { children?: ReactNode }) {
 *     const ctx = useAlertingDialogContext();
 *     const insight = useMyDecoratedInsight(ctx.insight);
 *     const decorated = useMemo(() => ({ ...ctx, insight }), [ctx, insight]);
 *     return <AlertingDialogContextProvider value={decorated}>{children}</AlertingDialogContextProvider>;
 * }
 * // <Dashboard AlertingDialogContextDecoratorComponent={InsightDecorator} />
 * ```
 *
 * Pass `isLoading` through untouched: the dialog's state model defers seeding until it is
 * false, and a decorator that overrides it corrupts the draft seed. Define the decorator
 * outside render, or the dialog remounts (and reseeds) on every parent render.
 *
 * @alpha
 */
export type CustomAlertingDialogContextDecoratorComponent = ComponentType<{ children?: ReactNode }>;

/**
 * @alpha
 */
export type CustomAlertingManagementDialogComponent = ComponentType<IAlertingManagementDialogProps>;

/**
 * @alpha
 */
export interface IAlertDropdownProps {
    isReadOnly?: boolean;
    paused: boolean;
    alignTo: HTMLElement;
    onClose: () => void;
    onDelete: () => void;
    onPause: () => void;
    onEdit: () => void;
    onResume: () => void;
}

//
//
//

/**
 * The period a relative alert condition compares the measure against.
 *
 * @alpha
 */
export enum AlertMetricComparatorType {
    PreviousPeriod,
    SamePeriodPreviousYear,
}

/**
 * A comparison the alerting dialog can offer for a measure: the derived period-over-period measure
 * and the date dataset and granularity it is computed over.
 *
 * @alpha
 */
export type AlertMetricComparator = {
    /**
     * The derived measure (previous period / same period previous year) the condition compares against.
     */
    measure: IMeasure;
    /**
     * Whether the derived measure is itself a primary measure of the insight.
     */
    isPrimary: boolean;
    /**
     * Which period the derived measure shifts by.
     */
    comparator: AlertMetricComparatorType;
    /**
     * The date dataset the period shift is computed over, when the insight resolves one.
     */
    dataset?: IDataSetMetadataObject;
    /**
     * The granularity of the period shift, when the insight resolves one.
     */
    granularity?: DateAttributeGranularity;
};

/**
 * A measure of the insight the alerting dialog can build a condition on, with the comparisons
 * available for it.
 *
 * @alpha
 */
export type AlertMetric = {
    /**
     * The insight measure.
     */
    measure: IMeasure;
    /**
     * Whether the measure is a primary (non-derived) measure of the insight.
     */
    isPrimary: boolean;
    /**
     * The period-over-period comparisons the dialog offers for this measure; empty when none apply.
     */
    comparators: AlertMetricComparator[];
};

/**
 * An attribute of the insight the alert can be sliced by (the "for" row of the condition).
 *
 * @alpha
 */
export type AlertAttribute = {
    /**
     * The insight attribute.
     */
    attribute: IAttribute;
    /**
     * Whether the attribute is a date attribute.
     */
    type: "dateAttribute" | "attribute";
};

/**
 * The operator id of an anomaly-detection condition (`"AI.ANOMALY_DETECTION"`).
 *
 * @alpha
 */
export type AlertAiOperator = `${typeof AI_OPERATOR}.${typeof AI_OPERATORS.ANOMALY_DETECTION}`;
