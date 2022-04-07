// (C) 2021-2022 GoodData Corporation
import { ComponentType } from "react";
import { IDashboardAttributeFilter } from "@gooddata/sdk-model";

/**
 * @alpha
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
}

/**
 * @alpha
 */
export type CustomDashboardAttributeFilterComponent = ComponentType<IDashboardAttributeFilterProps>;
