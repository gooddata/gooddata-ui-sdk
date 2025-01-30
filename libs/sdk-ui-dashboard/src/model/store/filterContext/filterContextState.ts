// (C) 2021-2025 GoodData Corporation

import { IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    IDashboardObjectIdentity,
    IFilterContextDefinition,
    IAttributeDisplayFormMetadataObject,
} from "@gooddata/sdk-model";

/**
 * @public
 */
export interface FilterContextState {
    /**
     * Filter context definition contains the actual filters to use. Filter context definition is present
     * @beta
     */
    filterContextDefinition?: IFilterContextDefinition;

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
}

export const filterContextInitialState: FilterContextState = {
    filterContextDefinition: undefined,
    filterContextIdentity: undefined,
    attributeFilterDisplayForms: undefined,
    attributesWithReferences: undefined,
};
