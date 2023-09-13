// (C) 2019-2023 GoodData Corporation

import {
    DashboardAttributeFilterSelectionMode,
    IAttributeElement,
    IAttributeFilter,
    IAttributeMetadataObject,
    ObjRef,
} from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { AttributeFiltersOrPlaceholders, ILocale, IPlaceholder, GoodDataSdkError } from "@gooddata/sdk-ui";

import { IAttributeFilterElementsActionsProps } from "./Components/ElementsSelect/AttributeFilterElementsActions.js";
import { IAttributeFilterErrorProps } from "./Components/AttributeFilterError.js";
import { IAttributeFilterLoadingProps } from "./Components/AttributeFilterLoading.js";
import { IAttributeFilterDropdownButtonProps } from "./Components/DropdownButton/AttributeFilterDropdownButton.js";
import { IAttributeFilterDropdownBodyProps } from "./Components/Dropdown/types.js";
import { IAttributeFilterDropdownActionsProps } from "./Components/Dropdown/AttributeFilterDropdownActions.js";
import { IAttributeFilterElementsSearchBarProps } from "./Components/ElementsSelect/AttributeFilterElementsSearchBar.js";
import {
    IAttributeFilterElementsSelectItemProps,
    IAttributeFilterElementsSelectProps,
} from "./Components/ElementsSelect/types.js";
import { IAttributeFilterElementsSelectLoadingProps } from "./Components/ElementsSelect/AttributeFilterElementsSelectLoading.js";
import { IAttributeFilterElementsSelectErrorProps } from "./Components/ElementsSelect/AttributeFilterElementsSelectError.js";
import { IAttributeFilterEmptyResultProps } from "./Components/ElementsSelect/EmptyResult/AttributeFilterEmptyResult.js";
import { IAttributeFilterStatusBarProps } from "./Components/ElementsSelect/StatusBar/AttributeFilterStatusBar.js";

/**
 * @public
 */
export type OnApplyCallbackType = (
    filter: IAttributeFilter,
    isInverted: boolean,
    selectionMode?: DashboardAttributeFilterSelectionMode,
) => void;

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
    extends IAttributeFilterCoreProps,
        IAttributeFilterCustomComponentProps {}

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
"     */
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
     *
     * Note: It's not possible to combine this property with "connectToPlaceholder" property. Either - provide a value, or a placeholder.
     * The 'onApply' callback must be specified in order to handle filter changes.
     */
    filter?: IAttributeFilter;

    /**
     * Specifies a parent attribute filter that will be used to reduce options for for current attribute filter.
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
     * Specify function which will be called when user clicks 'Apply' button.
     *
     * @remarks
     * The function will receive the current specification of the filter, as it was updated by the user.
     *
     * @param filter - new value of the filter.
     */
    onApply?: OnApplyCallbackType;

    /**
     * Callback that will be triggered when error is thrown.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Provide pre-loaded attribute so its load can be omitted during the initialization.
     */
    attribute?: IAttributeMetadataObject;
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
    ErrorComponent?: React.ComponentType<IAttributeFilterErrorProps>;

    /**
     * Customize attribute filter with a component to be rendered if attribute filter is loading.
     * Note that this will be rendered only during the initialization of the attribute filter.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterLoading} will be used.
     * @beta
     */
    LoadingComponent?: React.ComponentType<IAttributeFilterLoadingProps>;

    /**
     * Customize attribute filter dropdown button component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterDropdownButton} or {@link AttributeFilterSimpleDropdownButton} will be used.
     *
     * @beta
     */
    DropdownButtonComponent?: React.ComponentType<IAttributeFilterDropdownButtonProps>;

    /**
     * Customize attribute filter dropdown body component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterDropdownBody} will be used.
     *
     * @beta
     */
    DropdownBodyComponent?: React.ComponentType<IAttributeFilterDropdownBodyProps>;

    /**
     * Customize attribute filter dropdown actions component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterDropdownActions} will be used.

     * @beta
     */
    DropdownActionsComponent?: React.ComponentType<IAttributeFilterDropdownActionsProps>;

    /**
     * Customize attribute filter search bar component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSearchBar} will be used.
     *
     * @beta
     */
    ElementsSearchBarComponent?: React.ComponentType<IAttributeFilterElementsSearchBarProps>;

    /**
     * Customize attribute filter elements select component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSelect} will be used.
     *
     * @beta
     */
    ElementsSelectComponent?: React.ComponentType<IAttributeFilterElementsSelectProps>;

    /**
     * Customize attribute filter elements select loading component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSelectLoading} will be used.
     *
     * @beta
     */
    ElementsSelectLoadingComponent?: React.ComponentType<IAttributeFilterElementsSelectLoadingProps>;

    /**
     * Customize attribute filter elements select item component.
     *
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSelectItem} will be used.
     *
     * @beta
     */
    ElementsSelectItemComponent?: React.ComponentType<IAttributeFilterElementsSelectItemProps>;

    /**
     * Customize attribute filter elements select action component (Select all checkbox)
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsActions} will be used.
     *
     * @beta
     */
    ElementsSelectActionsComponent?: React.ComponentType<IAttributeFilterElementsActionsProps>;

    /**
     * Customize attribute filter elements select error component.
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterElementsSelectError} will be used.
     * @beta
     */
    ElementsSelectErrorComponent?: React.ComponentType<IAttributeFilterElementsSelectErrorProps>;

    /**
     * Customize attribute filter empty result component.
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterEmptyResult} will be used.
     *
     * @beta
     */
    EmptyResultComponent?: React.ComponentType<IAttributeFilterEmptyResultProps>;

    /**
     * Customize attribute filter status bar component.
     * @remarks
     * -  If not provided, the default implementation {@link AttributeFilterStatusBar} will be used.
     * @beta
     */
    StatusBarComponent?: React.ComponentType<IAttributeFilterStatusBarProps>;
}
