// (C) 2019-2020 GoodData Corporation
import {
    IAttributeDisplayFormMetadataObject,
    IMeasureExpressionToken,
    ObjRef,
    IMetadataObject,
    IAttributeMetadataObject,
} from "@gooddata/sdk-model";

/**
 * Service for querying workspace metadata objects
 *
 * @public
 */
export interface IWorkspaceMetadata {
    /**
     * Gets the attribute display form with the provided identifier.
     * @param ref - ref of the attribute display form to retrieve
     * @returns promise of attribute display form metadata object
     */
    getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject>;

    /**
     * Get measure expression tokens for provided measure identifier
     * @param ref - ref of the measure
     * @returns promise of measure expression tokens
     */
    getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]>;

    /**
     * Get information about the given fact's dataset
     * @param ref - ref of the fact
     * @returns promise of metadata object
     */
    getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject>;

    /**
     * Get metadata of attribute
     * @param ref - ref of the attribute to retrieve
     * @returns promise of attribute metadata object
     */
    getAttribute(ref: ObjRef): Promise<IAttributeMetadataObject>;
}
