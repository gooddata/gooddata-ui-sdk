// (C) 2019-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterSelectionMode,
    type IAttributeElement,
    type IAttributeFilter,
    type IAttributeMetadataObject,
    type IDashboardDateFilter,
    type ILocale,
    type ObjRef,
} from "@gooddata/sdk-model";
import {
    type AttributeFiltersOrPlaceholders,
    type GoodDataSdkError,
    type IPlaceholder,
} from "@gooddata/sdk-ui";
import { type IAlignPoint, type OverlayPositionType } from "@gooddata/sdk-ui-kit";

import { type IAttributeFilterErrorProps } from "./Components/AttributeFilterError.js";
import { type IAttributeFilterLoadingProps } from "./Components/AttributeFilterLoading.js";
import { type IFilterButtonCustomIcon } from "../shared/interfaces/index.js";
import { type IAttributeFilterDropdownActionsProps } from "./Components/Dropdown/AttributeFilterDropdownActions.js";
import { type IAttributeFilterDropdownBodyProps } from "./Components/Dropdown/types.js";
import { type IAttributeFilterDropdownButtonProps } from "./Components/DropdownButton/AttributeFilterDropdownButton.js";
import { type IAttributeFilterElementsActionsProps } from "./Components/ElementsSelect/AttributeFilterElementsActions.js";
import { type IAttributeFilterElementsSearchBarProps } from "./Components/ElementsSelect/AttributeFilterElementsSearchBar.js";
import { type IAttributeFilterElementsSelectErrorProps } from "./Components/ElementsSelect/AttributeFilterElementsSelectError.js";
import { type IAttributeFilterElementsSelectLoadingProps } from "./Components/ElementsSelect/AttributeFilterElementsSelectLoading.js";
import { type IAttributeFilterEmptyResultProps } from "./Components/ElementsSelect/EmptyResult/AttributeFilterEmptyResult.js";
import { type IAttributeFilterStatusBarProps } from "./Components/ElementsSelect/StatusBar/types.js";
import {
    type IAttributeFilterElementsSelectItemProps,
    type IAttributeFilterElementsSelectProps,
} from "./Components/ElementsSelect/types.js";
import { type IFilterModeMenuProps } from "./Components/FilterModeMenu/types.js";
import { type ITextFilterBodyProps } from "./Components/TextFilterBody/types.js";
import { type AttributeFilterAvailableMode } from "./filterModeTypes.js";

/**
 * Configuration for the attribute filter header menu.
 *
 * @remarks
 * Groups together props that control the header menu behavior,
 * such as which filter modes are available and whether label switching is shown.
 *
 * @alpha
 */
export interface IAttributeFilterMenuConfig {
    /**
     * Limit which filter modes are available for switching.
     *
     * @remarks
     * When more than one mode is available, the mode switch menu is shown.
     * Defaults to all modes: ["elements", "arbitrary", "match"].
     * The UI maps arbitrary/match to internal text mode and distinguishes them by operator:
     * "is"/"isNot" = arbitrary, others = match.
     */
    availableFilterModes?: AttributeFilterAvailableMode[];

    /**
     * Show the "Values as" label switching section in the header menu.
     *
     * @remarks
     * When true, the "Values as" section is shown in the header menu,
     * allowing users to switch between different display forms of the attribute.
     * The section is only visible when the attribute has more than one display form.
     * Defaults to true.
     */
    showLabelsSwitch?: boolean;
}

/**
 * @public
 */
export type OnApplyCallbackType = (
    filter: IAttributeFilter,
    isInverted: boolean,
    selectionMode?: DashboardAttributeFilterSelectionMode,
    selectionTitles?: IAttributeElement[],
    displayAsLabel?: ObjRef,
    isResultOfMigration?: boolean,
    additionalProps?: {
        isSelectionInvalid?: boolean;
        applyToWorkingOnly?: boolean;
    },
) => void;

/**
 * Callback type for filter working selection changes.
 * Covers all modes: elements, arbitrary, match.
 *
 * @public
 */
export type OnChangeCallbackType = (
    filter: IAttributeFilter,
    isInverted: boolean,
    selectionMode?: DashboardAttributeFilterSelectionMode,
    selectionTitles?: IAttributeElement[],
    displayAsLabel?: ObjRef,
    isResultOfMigration?: boolean,
    additionalProps?: {
        isSelectionInvalid?: boolean;
        applyToWorkingOnly?: boolean;
    },
) => void;

/**
 * @public
 * @deprecated Use {@link OnChangeCallbackType} via onChange prop instead.
 */
export type OnSelectCallbackType = OnChangeCallbackType;

/**
 * @public
 */
export type ParentFilterOverAttributeType =
    | ObjRef
    | ((parentFilter: IAttributeFilter, index: number) => ObjRef);

/**
 * @public
 */
export interface IAttributeFilterBaseProps
    extends IAttributeFilterCoreProps, IAttributeFilterCustomComponentProps {}

/**
 * @public
 */
export interface IAttributeFilterCoreProps {
    /**
     * @internal
     *
     * @remarks
     * Internal purpose that is used for marking if filter reset children filters after changed
     * Default value is "true"
     */
    resetOnParentFilterChange?: boolean;

    /**
     * Specify an instance of analytical backend instance to work with.
     *
     * @remarks
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Specify workspace to work with.
     *
     * @remarks
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;

    /**
     * Specify an attribute filter that will be customized using this filter.
     *
     * @remarks
     * The component will use content of the filter and select the items that are already specified on the filter.
     * The filter type determines the filter mode internally:
     * - IPositiveAttributeFilter | INegativeAttributeFilter → elements mode
     * - IArbitraryAttributeFilter → arbitrary mode
     * - IMatchAttributeFilter → match mode
     *
     * Note: It's not possible to combine this property with "connectToPlaceholder" property. Either - provide a value, or a placeholder.
     * The 'onApply' callback must be specified in order to handle filter changes.
     * This filter definition needs to use primary label of given attribute for filter with elements selection or any label for text filters (arbitrary, match).
     */
    filter?: IAttributeFilter;

    /**
     * Specify a working attribute filter that will be shown.
     *
     * @remarks
     * If provided it will use the provided filter to show currently given working selection (controlled component).
     * If not provided this component will use its own internal state (uncontrolled component).
     *
     * @alpha
     * @deprecated dont use. Will be removed in future releases.
     */
    workingFilter?: IAttributeFilter;

    /**
     * Specifies a parent attribute filter that will be used to reduce options for current attribute filter.
     *
     * @remarks
     * Parent filters elements must contain their URIs due to current backend limitations.
     */
    parentFilters?: AttributeFiltersOrPlaceholders;

    /**
     * Specify {@link @gooddata/sdk-ui#IPlaceholder} to use to get and set the value of the attribute filter.
     *
     * @remarks
     * Note: It's not possible to combine this property with "filter" property. Either - provide a value, or a placeholder.
     * There is no need to specify 'onApply' callback if 'connectToPlaceholder' property is used as the value of the filter
     * is set via this placeholder.
     * Supports all filter modes: elements (positive/negative), arbitrary, and match.
     */
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>;

    /**
     * Specify the over attribute - an attribute the filter and its parent filter are connected through.
     *
     * @remarks
     * You can either provide an {@link @gooddata/sdk-model#ObjRef} which will be used for all the parent filters,
     * or you can provide a pure function that will be called for each parent filter to determine the respective over attribute.
     */
    parentFilterOverAttribute?: ParentFilterOverAttributeType;

    /**
     * Specify the items that are used for elements availability validation (metrics or attributes, labels,
     * or facts that the backend will use to build validation metrics from). Only the elements that are
     * compatible with the provided elements will be shown in the filter.
     *
     * @remarks
     * The property is supported only by some backend. The backends that do not support it will ignore it.
     */
    validateElementsBy?: ObjRef[];

    /**
     * Specifies a dependent date filter that will be used to reduce options for for current attribute filter.
     *
     * @beta
     */
    dependentDateFilters?: IDashboardDateFilter[];

    /**
     * Specify title for the attribute filter.
     *
     * @remarks
     * By default, the attribute name will be used.
     */
    title?: string;

    /**
     * Locale to use for localization of appearing texts.
     */
    locale?: ILocale;

    /**
     * If specified, these will be excluded from the elements available for selection and will also be removed from the resulting filter.
     * This effectively behaves as if those elements were not part of the underlying display form.
     *
     * @remarks
     * The meaning of the items is determined by the way the filter is specified: if the filter uses URIs,
     * then these are also interpreted as URIs, analogously with values.
     *
     * If using `hiddenElements`, make sure your input filter excludes the hidden elements, otherwise it could lead to
     * non-intuitive behavior.
     * So, for positive filters, make sure their elements do NOT contain any of the `hiddenElements`.
     * Inversely for negative filters, make sure their elements do contain all of the `hiddenElements`.
     *
     * @example
     * This is how to correctly create a filter that has some items hidden but is set to All:
     *
     * ```tsx
     * const hiddenUris: ["uri1", "uri2"];
     * // make sure to use the uris both in the filter...
     * const filter = newNegativeAttributeFilter("displayForm", { uris: hiddenUris });
     * // ...and also in the prop
     * return <AttributeFilter filter={filter} hiddenElements={hiddenUris} />
     * ```
     */
    hiddenElements?: string[];

    /**
     * If specified, these elements will replace the elements that would be loaded from the server.
     * Note that if using this, limiting measures and/or filters will not work: it is your responsibility to filter
     * the static elements yourself.
     */
    staticElements?: IAttributeElement[];

    /**
     * Customize, whether the filter should take the entire screen on mobile devices.
     */
    fullscreenOnMobile?: boolean;

    /**
     * Customize, how many elements can be selected by filter.
     *
     * @remarks
     * If filter is set as single selection then if `filter` definition is provided it needs to be positive filter with max one selected item.
     *
     *
     */
    selectionMode?: DashboardAttributeFilterSelectionMode;

    /**
     * Specify if first available element should be automatically selected for empty selection.
     *
     * @remarks
     * By default, the value is "false". Works only for `selectionMode` "single" and if current selection is empty.
     */
    selectFirst?: boolean;

    /**
     * Specifies the visibility mode of the filter.
     *
     * @alpha
     */
    disabled?: boolean;

    /**
     * Represents a custom icon along with a tooltip.
     *
     * @alpha
     */
    customIcon?: IFilterButtonCustomIcon;

    /**
     * Provide a attribute filter label used for representing elements in component.
     * Used only for filter with elements selection. For text filters (arbitrary, match) it is not used.
     *
     * @alpha
     */
    displayAsLabel?: ObjRef;

    /**
     * This enables filter mode without apply button.
     * If true, it is responsibility of a client, to apply filters when needed.
     * Typically uses onChange callback to catch filter state.
     * Note, onApply callback is not called when this is true.
     *
     * @alpha
     */
    withoutApply?: boolean;

    /**
     * Specify function which will be called when user clicks 'Apply' button on this filter.
     * Note: this callback is typically not called when using Dashboard apply filters mode ALL_AT_ONCE
     * because there is no apply button dispalyed in attribute filter component.
     * See withoutApply prop.
     *
     * @remarks
     * The function will receive the current specification of the filter, as it was updated by the user.
     *
     * @param filter - new value of the filter.
     */
    onApply?: OnApplyCallbackType;

    /**
     * Specify function which will be called when user changes filter working selection.
     * This is the selection that is staged for application. Not applied yet.
     * Covers all filter modes: elements, arbitrary, match.
     *
     * @remarks
     * The function will receive the current specification of the filter, as it was updated by the user.
     *
     * @param filter - new value of the filter.
     */
    onChange?: OnChangeCallbackType;

    /**
     * Specify function which will be called when user changes filter working selection.
     *
     * @deprecated Use onChange prop instead. Will be removed in a future release.
     */
    onSelect?: OnSelectCallbackType;

    /**
     * Callback that will be triggered when error is thrown.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback that will be triggered when initialization loading state changes.
     *
     * @param loading - true if loading, false if not loading
     * @param attribute - attribute metadata object when it is a success event, undefined otherwise
     */
    onInitLoadingChanged?: (loading: boolean, attribute?: IAttributeMetadataObject) => void;

    /**
     * Enables the migration of displayAsLabel to be immediately reported to the parent app.
     */
    enableImmediateAttributeFilterDisplayAsLabelMigration?: boolean;

    /**
     * Specifies the overlay position type for the attribute filter dropdown.
     */
    overlayPositionType?: OverlayPositionType;

    /**
     * Specifies the align points for the attribute filter dropdown body.
     * In other words where the dropdown body should be placed.
     */
    alignPoints?: IAlignPoint[];

    /**
     * Configuration for the attribute filter header menu.
     *
     * @remarks
     * Groups together props controlling the header menu:
     * available filter modes and label switching visibility.
     *
     * @alpha
     */
    menuConfig?: IAttributeFilterMenuConfig;

    /**
     * When true, hides all help/info tooltip icons within the attribute filter.
     *
     * @remarks
     * This affects:
     * - The info icon in the dropdown header showing attribute details
     * - The tooltip icons next to section headers in the filter mode menu
     * - The tooltip icon next to the "Values" label in the text filter body
     *
     * @alpha
     */
    hideTooltips?: boolean;

    /**
     * When true, always show the dropdown header with title and filter mode menu,
     * even when there is only one available filter mode.
     *
     * @remarks
     * Defaults to false. When false, the header is only shown when there are
     * multiple filter modes or display form switching is available.
     *
     * @alpha
     */
    showHeader?: boolean;
}

/**
 * These customization properties allow you to specify custom components that the AttributeFilter
 * component will use for rendering different parts.
 *
 * @remarks
 * IMPORTANT: while this interface is marked as public, you also need to heed the maturity annotations
 * on each Customization properties,that are at this moment beta level.
 *
 * @public
 */
export interface IAttributeFilterCustomComponentProps {
    /**
     * Customize attribute filter with a component to be rendered if initialization fails.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterError} will be used.
     * @beta
     */
    ErrorComponent?: ComponentType<IAttributeFilterErrorProps>;

    /**
     * Customize attribute filter with a component to be rendered if attribute filter is loading.
     * Note that this will be rendered only during the initialization of the attribute filter.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterLoading} will be used.
     * @beta
     */
    LoadingComponent?: ComponentType<IAttributeFilterLoadingProps>;

    /**
     * Customize attribute filter dropdown button component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterDropdownButton} or {@link AttributeFilterSimpleDropdownButton} will be used.
     *
     * @beta
     */
    DropdownButtonComponent?: ComponentType<IAttributeFilterDropdownButtonProps>;

    /**
     * Customize attribute filter dropdown body component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterDropdownBody} will be used.
     *
     * @beta
     */
    DropdownBodyComponent?: ComponentType<IAttributeFilterDropdownBodyProps>;

    /**
     * Customize attribute filter dropdown actions component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterDropdownActions} will be used.

     * @beta
     */
    DropdownActionsComponent?: ComponentType<IAttributeFilterDropdownActionsProps>;

    /**
     * Customize attribute filter search bar component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSearchBar} will be used.
     *
     * @beta
     */
    ElementsSearchBarComponent?: ComponentType<IAttributeFilterElementsSearchBarProps>;

    /**
     * Customize attribute filter elements select component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSelect} will be used.
     *
     * @beta
     */
    ElementsSelectComponent?: ComponentType<IAttributeFilterElementsSelectProps>;

    /**
     * Customize attribute filter elements select loading component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSelectLoading} will be used.
     *
     * @beta
     */
    ElementsSelectLoadingComponent?: ComponentType<IAttributeFilterElementsSelectLoadingProps>;

    /**
     * Customize attribute filter elements select item component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSelectItem} will be used.
     *
     * @beta
     */
    ElementsSelectItemComponent?: ComponentType<IAttributeFilterElementsSelectItemProps>;

    /**
     * Customize attribute filter elements select action component (Select all checkbox)
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsActions} will be used.
     *
     * @beta
     */
    ElementsSelectActionsComponent?: ComponentType<IAttributeFilterElementsActionsProps>;

    /**
     * Customize attribute filter elements select error component.
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSelectError} will be used.
     * @beta
     */
    ElementsSelectErrorComponent?: ComponentType<IAttributeFilterElementsSelectErrorProps>;

    /**
     * Customize attribute filter empty result component.
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterEmptyResult} will be used.
     *
     * @beta
     */
    EmptyResultComponent?: ComponentType<IAttributeFilterEmptyResultProps>;

    /**
     * Customize attribute filter status bar component.
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterStatusBar} will be used.
     * @beta
     */
    StatusBarComponent?: ComponentType<IAttributeFilterStatusBarProps>;

    /**
     * Customize filter mode menu component.
     * @remarks
     * -  If not provided, the default implementation {@link FilterModeMenu} will be used.
     * @alpha
     */
    FilterModeMenuComponent?: ComponentType<IFilterModeMenuProps>;

    /**
     * Customize text filter body component.
     * @remarks
     * -  If not provided, the default implementation {@link TextFilterBody} will be used.
     * @alpha
     */
    TextFilterBodyComponent?: ComponentType<ITextFilterBodyProps>;
}
