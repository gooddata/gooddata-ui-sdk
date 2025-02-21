// (C) 2021-2025 GoodData Corporation
import { ComponentType } from "react";
import { IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";

import { IDashboardAttributeFilterParentItem, IDashboardDependentDateFilter } from "../../../model/index.js";
import type { IAttributeFilterButtonProps } from "@gooddata/sdk-ui-filters";

/**
 * @public
 */
export interface IDashboardAttributeFilterProps {
    /**
     * Definition of filter to render.
     */
    filter: IDashboardAttributeFilter;

    /**
     * When the user interacts with the filter and changes its value, it MUST use this callback to propagate the
     * new filter value.
     *
     * @param filter - new attribute filter value.
     * @param displayAsLabel - label used for presentation of attribute filter elements in UI
     * @param isWorkingSelectionChange - if the change is to applied (application of filters) or unapplied filters (filters staged before application).
     */
    onFilterChanged: (
        filter: IDashboardAttributeFilter,
        displayAsLabel?: ObjRef,
        isWorkingSelectionChange?: boolean,
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
}

/**
 * @public
 */
export type CustomDashboardAttributeFilterComponent = ComponentType<IDashboardAttributeFilterProps>;

/**
 * @internal
 */
export interface IDashboardAttributeFilterPlaceholderProps {
    className?: string;
    bodyClassName?: string;
    onSelect: (displayForm: ObjRef) => void;
    onClose: () => void;
}

/**
 * @internal
 */
export type ValuesLimitingItem = IDashboardAttributeFilterParentItem | ObjRef | IDashboardDependentDateFilter;
