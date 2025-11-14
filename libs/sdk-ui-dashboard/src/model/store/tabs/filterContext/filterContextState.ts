// (C) 2021-2025 GoodData Corporation

import { IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    FilterContextItem,
    IAttributeDisplayFormMetadataObject,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IDashboardObjectIdentity,
    IFilterContextDefinition,
} from "@gooddata/sdk-model";

/**
 * Partial working attribute filter used in working filter context.
 *
 * @alpha
 */
export type WorkingDashboardAttributeFilter = {
    attributeFilter: Partial<IDashboardAttributeFilter["attributeFilter"]>;
};

/**
 * Partial working filter context item.
 *
 * @alpha
 */
export type WorkingFilterContextItem = WorkingDashboardAttributeFilter | IDashboardDateFilter;

/**
 * Working filter context.
 *
 * @alpha
 */
export interface IWorkingFilterContextDefinition {
    /**
     * Partial attribute or date filters
     */
    readonly filters: WorkingFilterContextItem[];
}

/**
 * @public
 */
export interface FilterContextState {
    /**
     * Array of local IDs for filters that have invalid selections.
     * This is used to track and indicate filters that have selection problems.
     * @alpha
     */
    filtersWithInvalidSelection: string[];

    /**
     * Filter context definition contains the actual filters to use. They are applied and used to compute insights data.
     * Filter context definition is present.
     * @beta
     */
    filterContextDefinition?: IFilterContextDefinition;

    /**
     * Contains staged filters state which are not applied by the user yet.
     * They are used to show selected values in filters and when user requests, they are applied to the filterContextDefinition (above).
     *
     * @remarks
     * This working filter context contains only changed filters and their fields.
     * before using this working, this state is merged with filterContextDefinition.
     *
     * This way we do not need to synchronize other fields, which makes it easier to maintain.
     *
     * This state is used when DashboardFiltersApplyMode is ALL_AT_ONCE.
     * But can be used programmatically when embedding the dashboard too.
     *
     * @alpha
     */
    workingFilterContextDefinition?: IWorkingFilterContextDefinition;

    /**
     * Filter context definition contains the original dashboard filters stored on the backend.
     * @beta
     */
    originalFilterContextDefinition?: IFilterContextDefinition;

    /**
     * Filter context identity is available for persisted filter contexts.
     *
     * @remarks
     * This property may be undefined in two circumstances:
     *
     * -  a new, yet unsaved dashboard; the filter context is saved together with the dashboard and after the
     *    save the identity will be known and added
     *
     * -  export of an existing, saved dashboard; during the export the dashboard receives a temporary
     *    filter context that represents values of filters at the time the export was initiated - which may
     *    be different from what is saved in the filter context itself. that temporary context is not
     *    persistent and lives only for that particular export operation.
     *
     * @beta
     */
    filterContextIdentity?: IDashboardObjectIdentity;

    /**
     * Display form metadata objects for all attribute filters in the `filterContextDefinition`
     * @beta
     */
    attributeFilterDisplayForms?: IAttributeDisplayFormMetadataObject[];

    /**
     * Attribute metadata objects with referenced objects for all attribute filters in the `filterContextDefinition`
     * @beta
     */
    attributesWithReferences?: IAttributeWithReferences[];

    /**
     * Default filter overrides for the dashboard, provided via `overrideDefaultFilters` dashboard config,
     * after sanitization and merging with the original filter context definition.
     * @beta
     */
    defaultFilterOverrides?: FilterContextItem[];
}

export const filterContextInitialState: FilterContextState = {
    filtersWithInvalidSelection: [],
    filterContextDefinition: undefined,
    workingFilterContextDefinition: undefined,
    filterContextIdentity: undefined,
    attributeFilterDisplayForms: undefined,
    attributesWithReferences: undefined,
    defaultFilterOverrides: undefined,
};
