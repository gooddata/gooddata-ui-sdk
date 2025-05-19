// (C) 2021-2025 GoodData Corporation
import { ComponentType } from "react";
import { DateFilterGranularity, IDashboardDateFilter } from "@gooddata/sdk-model";
import { IDateFilterOptionsByType, IDateFilterButtonProps } from "@gooddata/sdk-ui-filters";
import { OverlayPositionType } from "@gooddata/sdk-ui-kit";

/**
 * Defines the configuration of the DateFilter component.
 *
 * @public
 */
export interface IDashboardDateFilterConfig {
    /**
     * Granularities available in the Floating range form.
     * @alpha
     */
    availableGranularities: DateFilterGranularity[];

    /**
     * A {@link @gooddata/sdk-ui-filters#IDateFilterOptionsByType} configuration of the Date Filter.
     * @alpha
     */
    dateFilterOptions: IDateFilterOptionsByType;

    /**
     * Specify custom filter name. Defaults to "Date range" (or its localized equivalent).
     */
    customFilterName?: string;
}

/**
 * @public
 */
export interface IDashboardDateFilterProps {
    /**
     * Definition of filter to render.
     */
    filter: IDashboardDateFilter | undefined;

    /**
     * Definition of working filter used to render selected options.
     */
    workingFilter: IDashboardDateFilter | undefined;

    /**
     * When the user interacts with the filter and changes its value, it MUST use this callback to propagate the
     * new filter value.
     *
     * @param filter - new date filter value
     * @param dateFilterOptionLocalId - localId of the {@link @gooddata/sdk-backend-spi#IDateFilterOption} selected
     * @param isWorkingSelectionChange - determines if the change is in working filter state (staged for application but not applied yet)
     */
    onFilterChanged: (
        filter: IDashboardDateFilter | undefined,
        dateFilterOptionLocalId?: string,
        isWorkingSelectionChange?: boolean,
    ) => void;

    /**
     * Additional DateFilter configuration.
     */
    config: IDashboardDateFilterConfig;

    /**
     * Specify whether the filter should be readonly.
     */
    readonly?: boolean;

    /**
     * Specify whether dragging handle and grab cursor should be displayed on hover
     */
    isDraggable?: boolean;

    /**
     * Specify whether should render filter with open dropdown
     */
    autoOpen?: boolean;

    /**
     * Specify custom button component
     *
     * @alpha
     */
    ButtonComponent?: ComponentType<IDateFilterButtonProps>;

    /**
     * Specifies the overlay position type for the date filter dropdown.
     */
    overlayPositionType?: OverlayPositionType;
}

/**
 * @public
 */
export type CustomDashboardDateFilterComponent = ComponentType<IDashboardDateFilterProps>;
