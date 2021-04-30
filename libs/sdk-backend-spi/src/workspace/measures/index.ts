// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IMeasureExpressionToken } from "../fromModel/ldm/measure";
import { IMeasureMetadataObject } from "../fromModel/ldm/metadata";
import { IMeasureMetadataObjectDefinition } from "../fromModel/ldm/metadata";

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
     * @param measure
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
}
