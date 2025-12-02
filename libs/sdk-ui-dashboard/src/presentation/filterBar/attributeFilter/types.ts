// (C) 2021-2025 GoodData Corporation

import { ComponentType, ReactNode } from "react";

import {
    ICatalogAttribute,
    ICatalogDateDataset,
    IDashboardAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import type { IAttributeFilterButtonProps } from "@gooddata/sdk-ui-filters";
import { IDropdownListNoDataRenderProps, OverlayPositionType } from "@gooddata/sdk-ui-kit";

import { IAddAttributeFilterButtonProps } from "./addAttributeFilter/AddAttributeFilterButton.js";
import { IDashboardAttributeFilterParentItem, IDashboardDependentDateFilter } from "../../../model/index.js";

/**
 * @public
 */
export interface IDashboardAttributeFilterProps {
    /**
     * Definition of filter to render.
     */
    filter: IDashboardAttributeFilter;

    /**
     * Working filter which selection will be used to render.
     */
    workingFilter?: IDashboardAttributeFilter;

    /**
     * When the user interacts with the filter and changes its value, it MUST use this callback to propagate the
     * new filter value.
     *
     * @param filter - new attribute filter value.
     * @param displayAsLabel - label used for presentation of attribute filter elements in UI
     * @param isWorkingSelectionChange - if the change is to applied (application of filters) or un-applied filters (filters staged before application).
     * @param isResultOfMigration - internal value, specifies that filter change was caused by displayAsLabel
     *  ad-hoc migration, the param will be removed once the usage of displayAsLabel is migrated on database
     *  metadata level.
     * @param isSelectionInvalid - specifies if filter selection is invalid
     */
    onFilterChanged: (
        filter: IDashboardAttributeFilter,
        displayAsLabel?: ObjRef,
        isWorkingSelectionChange?: boolean,
        isResultOfMigration?: boolean,
        isSelectionInvalid?: boolean,
    ) => void;

    /**
     * Callback to be called, when user closes filter dropdown
     */
    onClose?: () => void;

    /**
     * Specify whether dragging handle and grab cursor should be displayed on hover
     */
    isDraggable?: boolean;

    /**
     * Specify whether should render filter with open dropdown
     */
    autoOpen?: boolean;

    /**
     * Specify whether the filter should be readonly.
     *
     * @alpha
     */
    readonly?: boolean;

    /**
     * Attribute label to use for UI representation of filter elements
     */
    displayAsLabel?: ObjRef;

    /**
     * Optional custom attribute filter component to change or extend the default rendered one.
     * The default is AttributeFilterButton
     * Other component which fits this interface provided by GD is AttributeFilter
     *
     * Note: Props provided to this component contains many filter customizations.
     *       E.g. parent/child filtering, cross filtering, various subcomponents etc.
     *       see {@link @gooddata/sdk-ui-filters#IAttributeFilterButtonProps} for more details.
     *
     * @alpha use at your own risk
     */
    AttributeFilterComponent?: ComponentType<IAttributeFilterButtonProps>;

    /**
     * Optional custom attribute filter loading component to change or extend the default rendered one.
     */
    AttributeFilterLoadingComponent?: ComponentType;

    /**
     * Specifies the overlay position type for the attribute filter dropdown.
     */
    overlayPositionType?: OverlayPositionType;
}

/**
 * @public
 */
export type CustomDashboardAttributeFilterComponent = ComponentType<IDashboardAttributeFilterProps>;

/**
 * @internal
 */
export interface IDashboardAttributeFilterAccessibilityConfig {
    ariaLabelledBy?: string;
    searchAriaLabel?: string;
}

/**
 * @internal
 */
export interface IDashboardAttributeFilterPlaceholderProps {
    id?: string;
    className?: string;
    bodyClassName?: string;
    onSelect: (displayForm: ObjRef) => void;
    onOpen?: () => void;
    onClose?: () => void;
    attributes: ICatalogAttribute[];
    dateDatasets: ICatalogDateDataset[];
    openOnInit?: boolean;
    DropdownButtonComponent?: ComponentType<IAddAttributeFilterButtonProps>;
    DropdownTitleComponent?: ComponentType;
    renderNoData?: (props: IDropdownListNoDataRenderProps) => ReactNode;
    overlayPositionType?: OverlayPositionType;
    renderVirtualisedList?: boolean;
    getCustomItemTitle?: (item: ICatalogAttribute | ICatalogDateDataset) => string | undefined;
    accessibilityConfig?: IDashboardAttributeFilterAccessibilityConfig;
}

/**
 * @internal
 */
export type ValuesLimitingItem = IDashboardAttributeFilterParentItem | ObjRef | IDashboardDependentDateFilter;
