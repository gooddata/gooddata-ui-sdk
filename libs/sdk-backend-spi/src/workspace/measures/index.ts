// (C) 2019-2025 GoodData Corporation

import {
    IInsight,
    IMeasure,
    IMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
    IMetadataObject,
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    ObjRef,
    ObjectOrigin,
} from "@gooddata/sdk-model";

import { IMeasureExpressionToken } from "./measure.js";
import { IFilterBaseOptions } from "../../common/filtering.js";
import { IPagedResource } from "../../common/paging.js";

/**
 * Contains information about objects that may be referencing an measure. {@link IWorkspaceMeasuresService.getMeasureReferencingObjects} function.
 *
 * @public
 */
export interface IMeasureReferencing {
    measures?: IMetadataObject[];
    insights?: IInsight[];
}

/**
 * Options for getting a measure.
 *
 * @public
 */
export interface IGetMeasureOptions {
    /**
     * Specifies whether information about the users who created or modified the measure should be loaded.
     *
     * @remarks
     * Defaults to false.
     */
    loadUserData?: boolean;
}

/**
 * Contains information about key drivers for a given measure.
 *
 * @alpha
 */
export interface IMeasureKeyDrivers {
    /**
     * Labels for the key drivers
     */
    labels: string[];

    /**
     * Effects for the key drivers
     */
    effects: number[];
}

/**
 * Service for create, update or delete measures and querying additional measures data.
 * If you want to query measures themselves, use catalog {@link IWorkspaceCatalogFactory}
 *
 * @public
 */
export interface IWorkspaceMeasuresService {
    /**
     * Compute key drivers for a given measure.
     *
     * @param metric - the measure to compute key drivers for
     * @param sortDirection - the direction to sort the key drivers by
     * @returns promise of the key drivers
     * @alpha
     */
    computeKeyDrivers: (
        measure: IMeasure,
        options?: {
            sortDirection: "ASC" | "DESC";
        },
    ) => Promise<IMeasureKeyDrivers>;

    /**
     * Get measure expression tokens for provided measure identifier
     * @param ref - ref of the measure
     * @returns promise of measure expression tokens
     */
    getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]>;

    /**
     * Create and save measure for the provided measure definition
     *
     * @param measure - measure definition
     * @returns promise of created measure
     */
    createMeasure(measure: IMeasureMetadataObjectDefinition): Promise<IMeasureMetadataObject>;

    /**
     * Update provided measure
     *
     * @param measure - measure to update
     * @returns promise of updated measure
     */
    updateMeasure(measure: IMeasureMetadataObject): Promise<IMeasureMetadataObject>;

    /**
     * Update metadata object for the measure
     *
     * @param measure - metadata object to update
     * @returns promise of updated measure
     */
    updateMeasureMeta(
        measure: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IMeasureMetadataObject>;

    /**
     * Delete measure with the given reference
     *
     * @param measureRef - ref of the measure to delete
     * @returns promise of undefined
     */
    deleteMeasure(measureRef: ObjRef): Promise<void>;

    /**
     * Get all metadata objects which uses specified object (ie. object is used by these objects) by a given reference.
     *
     * @param measureRef - ref of the measure to check
     * @returns promise of references
     */
    getMeasureReferencingObjects(measureRef: ObjRef): Promise<IMeasureReferencing>;

    /**
     * Measures query factory.
     *
     * @returns measures query
     */
    getMeasuresQuery(): IMeasuresQuery;

    /**
     * Get measure by reference
     *
     * @param ref - ref of the measure to get
     * @param options - options for getting the measure
     * @returns promise of measure
     */
    getMeasure(ref: ObjRef, options?: IGetMeasureOptions): Promise<IMeasureMetadataObject>;

    /**
     * Get connected attributes for a measure
     *
     * @param definition - definition of measure
     * @param auxMeasures - optional aux measures
     */
    getConnectedAttributes(definition: IMeasure, auxMeasures?: IMeasure[]): Promise<ObjRef[]>;
}

/**
 * Service to query measures.
 *
 * @public
 */
export interface IMeasuresQuery {
    /**
     * Sets number of measures to return per page.
     * Default size: 50
     *
     * @param size - desired max number of measures per page must be a positive number
     * @returns measures query
     */
    withSize(size: number): IMeasuresQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns measures query
     */
    withPage(page: number): IMeasuresQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns measures query
     */
    withFilter(filter: IFilterBaseOptions): IMeasuresQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns measures query
     */
    withSorting(sort: string[]): IMeasuresQuery;

    /**
     * Sets include for the query.
     *
     * @param include - include to apply
     * @returns measures query
     */
    withInclude(include: string[]): IMeasuresQuery;

    /**
     * Sets origin for the query.
     *
     * @param origin - origin to apply. This is an open string union to allow platform-specific origin values in addition to the built-in literals.
     * @returns measures query
     */
    withOrigin(origin: ObjectOrigin | (string & {})): IMeasuresQuery;

    /**
     * Starts the query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IMeasuresQueryResult>;
}

/**
 * Queried measures are returned in a paged representation.
 *
 * @public
 */
export type IMeasuresQueryResult = IPagedResource<IMeasureMetadataObject>;
