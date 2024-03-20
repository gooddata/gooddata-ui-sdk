// (C) 2021-2024 GoodData Corporation
import { ComponentType } from "react";
import { IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";

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
     * When the user interacts with the filter and changes its value, it MUST use this callback to propagate the
     * new filter value.
     *
     * @param filter - new attribute filter value.
     */
    onFilterChanged: (filter: IDashboardAttributeFilter) => void;

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
