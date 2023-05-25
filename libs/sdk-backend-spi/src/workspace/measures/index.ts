// (C) 2019-2022 GoodData Corporation
import {
    IMetadataObject,
    ObjRef,
    IMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
    IInsight,
} from "@gooddata/sdk-model";
import { IMeasureExpressionToken } from "./measure.js";

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
 * Service for create, update or delete measures and querying additional measures data.
 * If you want to query measures themselves, use catalog {@link IWorkspaceCatalogFactory}
 *
 * @public
 */
export interface IWorkspaceMeasuresService {
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
}
