// (C) 2019-2020 GoodData Corporation
import {
    IAttributeDisplayFormMetadataObject,
    IMeasureExpressionToken,
    ObjRef,
    IMetadataObject,
} from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceMetadata {
    /**
     * Gets the attribute display form with the provided identifier.
     * @param ref - ref of the attribute display form to retrieve
     * @public
     */
    getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject>;

    /**
     * Get measure expression tokens for provided measure identifier
     * @param ref - ref of the measure
     */
    getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]>;

    /**
     * Get information about the given fact's dataset
     * @param ref - ref of the fact
     */
    getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject>;
}
