// (C) 2020-2026 GoodData Corporation

import { type ComponentType } from "react";

import { isEmpty } from "lodash-es";

import {
    type IMeasureMetadataObject,
    type IMeasureValueFilter,
    type MeasureValueFilterCondition,
    type ObjRef,
    type ObjRefInScope,
} from "@gooddata/sdk-model";
import { type ISeparators } from "@gooddata/sdk-ui";
import { type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { type IMeasureValueFilterDropdownButtonProps } from "./MeasureValueFilterButton.js";

/**
 * Type of dimensionality item for display purposes.
 * @beta
 */
export type DimensionalityItemType = "attribute" | "chronologicalDate" | "genericDate";

/**
 * Represents a dimensionality item with an identifier and human-readable title.
 * @beta
 */
export interface IDimensionalityItem {
    /**
     * The identifier of the dimensionality item (attribute or date reference).
     */
    identifier: ObjRefInScope;
    /**
     * Human-readable title for display purposes.
     */
    title: string;
    /**
     * Type of the item for icon rendering.
     * Defaults to "attribute" if not specified.
     */
    type: DimensionalityItemType;
    /**
     * Optional object reference for the item (typically the attribute/date display form reference).
     *
     * This is useful when the item `identifier` is a LocalIdRef (bucket item),
     * but we still want to compare/deduplicate it against catalog candidates that are referenced by ObjRef.
     *
     * @beta
     */
    ref?: ObjRef;
    /**
     * Optional dataset information for grouping catalog items.
     * Present for catalog items, undefined for bucket items.
     */
    dataset?: {
        /**
         * Dataset identifier.
         */
        identifier: ObjRef;
        /**
         * Human-readable dataset title.
         */
        title: string;
    };
}

/**
 * Date dataset option for the date dataset picker.
 * @internal
 */
export interface IDateDatasetOption {
    key: string;
    title: string;
}

/**
 * Props passed to a custom body component supplied via
 * {@link IMeasureValueFilterCustomComponentProps.BodyComponent}. The body is the area
 * between the optional header and the actions footer — by default it renders the
 * conditions, dimensionality and preview sections, and is replaced wholesale when
 * a `BodyComponent` is provided.
 *
 * @beta
 */
export interface IMeasureValueFilterBodyProps {
    /**
     * Callback invoked when the Apply control is activated.
     */
    onApplyButtonClick: () => void;
    /**
     * Closes the dropdown, mirroring a Cancel/Close click.
     */
    onCancelButtonClick: () => void;
}

/**
 * Props passed to a custom dropdown actions component supplied via
 * {@link IMeasureValueFilterCustomComponentProps.DropdownActionsComponent}.
 *
 * Mirrors {@link IAttributeFilterDropdownActionsProps} so that hosts can build
 * consistent custom footers across attribute and measure-value filters.
 *
 * @beta
 */
export interface IMeasureValueFilterDropdownActionsProps {
    /**
     * Callback invoked when the Apply control is activated. Triggers the standard
     * apply pipeline (same as clicking the default Apply button).
     */
    onApplyButtonClick: () => void;
    /**
     * Callback invoked when the Cancel/Close control is activated. Discards changes
     * and closes the dropdown (same as clicking the default Cancel button).
     */
    onCancelButtonClick: () => void;
    /**
     * If true, the Apply action should be disabled (e.g., invalid or unchanged state).
     */
    isApplyDisabled?: boolean;
    /**
     * Indicates whether the filter form state has diverged from the original filter.
     */
    isFilterChanged?: boolean;
    /**
     * Tooltip shown when the Apply button is disabled.
     */
    applyDisabledTooltip?: string;
    /**
     * If true, the host runs in "Apply together" mode — Apply is suppressed and changes
     * propagate through {@link IMeasureValueFilterCommonProps.onChange}. Custom action
     * components can use this flag to render only a Close affordance.
     */
    withoutApply?: boolean;
}

/**
 * Customizable component slots for the Measure Value Filter dropdown.
 *
 * Mirrors {@link IAttributeFilterCustomComponentProps} — every slot is a
 * `ComponentType<...>`, never a `ReactNode`. Omitted slots fall back to the
 * SDK defaults (the `HeaderComponent` slot has no default and renders nothing).
 *
 * @beta
 */
export interface IMeasureValueFilterCustomComponentProps {
    /**
     * Customize the dropdown body — the area between the header and the actions footer.
     *
     * @remarks
     * - If not provided, the default body (conditions + dimensionality + preview) is rendered.
     * - When provided, the host owns the entire body: typical uses include swapping in an
     *   alternate view such as a configuration panel.
     */
    BodyComponent?: ComponentType<IMeasureValueFilterBodyProps>;
    /**
     * Customize the dropdown actions (footer) component.
     *
     * @remarks
     * - If not provided, the default Cancel/Apply footer is rendered (or nothing when
     *   `withoutApply` is `true`).
     */
    DropdownActionsComponent?: ComponentType<IMeasureValueFilterDropdownActionsProps>;
}

/**
 * Callback payload used by the Measure Value Filter dropdown. `onChange` and `onApply`
 * are called with the same arguments; they only differ in when they are emitted.
 *
 * @beta
 */
export type IMeasureValueFilterDropdownCallback = (
    conditions: MeasureValueFilterCondition[] | null,
    dimensionality?: ObjRefInScope[],
    applyOnResult?: boolean,
) => void;

/**
 * @beta
 */
export interface IMeasureValueFilterCommonProps extends IMeasureValueFilterCustomComponentProps {
    filter?: IMeasureValueFilter;
    /**
     * Human-readable measure title used in UI texts (e.g., preview).
     * If not provided, the preview falls back to showing only operator/value parts.
     */
    measureTitle?: string;
    measureIdentifier: string;
    onApply: (filter: IMeasureValueFilter | null) => void;
    /**
     * Optional change callback used in {@link IMeasureValueFilterCommonProps.withoutApply} mode.
     *
     * When `withoutApply` is `true`, every meaningful state change (operator switch, value
     * commit, dimensionality update, treat-null-values toggle) is propagated through this
     * callback instead of waiting for the user to click the Apply button.
     *
     * @beta
     */
    onChange?: (filter: IMeasureValueFilter | null) => void;
    /**
     * When `true`, the dropdown hides its default Apply/Cancel footer and propagates
     * intermediate filter state through {@link IMeasureValueFilterCommonProps.onChange}
     * instead of accumulating changes until the user clicks Apply.
     *
     * Intended for hosts (such as the Dashboard "Apply together" mode) that collect
     * working filter changes and apply them via a global Apply action.
     *
     * @beta
     */
    withoutApply?: boolean;
    usePercentage?: boolean;
    warningMessage?: WarningMessage;
    locale?: string;
    separators?: ISeparators;
    /**
     * Number format pattern for the measure (e.g., "#,##0.00", "$#,##0", etc.).
     * When provided, values in the preview section will be formatted using this pattern.
     * If not provided, falls back to simple number formatting with separators.
     *
     * @beta
     */
    format?: string;
    /**
     * When true, uses K/M/B shortening for compact display in the preview (e.g., "1K" instead of "1,000").
     * When false or undefined, uses full metric format.
     * This provides consistency between the filter button and preview display.
     *
     * @beta
     */
    useShortFormat?: boolean;
    displayTreatNullAsZeroOption?: boolean;
    treatNullAsZeroDefaultValue?: boolean;
    enableOperatorSelection?: boolean;
    dimensionality?: IDimensionalityItem[];
    insightDimensionality?: IDimensionalityItem[];
    isDimensionalityEnabled?: boolean;
    /**
     * Controls visibility of the textual filter summary shown above the dropdown footer.
     *
     * Defaults to `true`.
     *
     * @beta
     */
    isFilterSummaryEnabled?: boolean;
    /**
     * Catalog items available for dimensionality
     */
    catalogDimensionality?: IDimensionalityItem[];
    /**
     * Callback for loading catalog dimensionality items lazily.
     *
     * When provided, the dimensionality picker can call this on demand (e.g. when opened)
     * to load compatible attributes/dates for the current dimensionality.
     *
     * @beta
     */
    loadCatalogDimensionality?: (dimensionality: ObjRefInScope[]) => Promise<IDimensionalityItem[]>;
    /**
     * Callback triggered when dimensionality changes.
     * Used to revalidate catalog items after selection changes.
     */
    onDimensionalityChange?: (dimensionality: ObjRefInScope[]) => void;
    /**
     * Whether catalog dimensionality is currently being loaded.
     * If true, the attribute picker can show a small loading indicator.
     */
    isLoadingCatalogDimensionality?: boolean;
    /**
     * Enables UI support for defining multiple measure value filter conditions.
     * When set to `false` (default), only a single condition is shown/edited and, if the provided filter
     * contains multiple conditions, only the first one is used.
     *
     * @beta
     */
    enableMultipleConditions?: boolean;
    /**
     * Enables using ranking filters together with measure value filters (MVF).
     *
     * @beta
     */
    enableRankingWithMvf?: boolean;
    /**
     * Loader for the metric details shown in the dropdown header tooltip.
     *
     * @remarks
     * Invoked the first time the user opens the tooltip — never on initial render.
     * Pass this only when you want the dropdown header to expose a question-mark
     * icon with lazily loaded metric metadata (description, format, identifier).
     *
     * @beta
     */
    loadMetricDetails?: () => Promise<IMeasureMetadataObject | undefined>;
    /**
     * When true, renders a header at the top of the dropdown body with the metric
     * title and a question-mark icon revealing metric details on hover/focus.
     *
     * Defaults to `false`.
     *
     * @beta
     */
    isHeaderEnabled?: boolean;
    /**
     * Optional alignment points for the dropdown overlay.
     *
     * @remarks
     * Mirrors the attribute filter alignment hook so hosts can position the MVF dropdown
     * differently in nested surfaces, for example inside a dashboard filter group.
     *
     * @beta
     */
    alignPoints?: IAlignPoint[];
    /**
     * When `true`, the dropdown takes the entire screen on mobile devices.
     *
     * @remarks
     * Hosts that render the MVF inside responsive surfaces (e.g. dashboards) opt in to
     * switch the overlay to a full-screen presentation on mobile viewports.
     *
     * Defaults to `false`.
     *
     * @beta
     */
    fullscreenOnMobile?: boolean;
}

/**
 * These customization properties allow you to specify custom components that the MeasureValueFilter
 * component will use for rendering different parts.
 *
 * @remarks
 * IMPORTANT: while this interface is marked as public, you also need to heed the maturity annotations
 * on each customization property; they are at this moment beta level. The interface will be extended
 * in the future to mirror the customization scope of the AttributeFilter.
 *
 * @public
 */
export interface IMeasureValueFilterCustomComponentsProps {
    /**
     * Customize MeasureValueFilter dropdown button (header) component.
     *
     * @remarks
     * -  If not provided, the default implementation will be used.
     *
     * @beta
     */
    DropdownButtonComponent?: ComponentType<IMeasureValueFilterDropdownButtonProps>;
}

/**
 * @beta
 */
export type WarningMessage = string | IWarningMessage;

/**
 * @beta
 */
export type IWarningMessage = {
    text: string;
    severity: "low" | "medium" | "high";
};

/**
 * @alpha
 */
export function isWarningMessage(obj: unknown): obj is IWarningMessage {
    return !isEmpty(obj) && !!(obj as IWarningMessage).severity;
}
