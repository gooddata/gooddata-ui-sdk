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

    /**
     * Request list of attributes that are "center of star" for the input attributes in the data model
     *
     * @param attributeRefs - input list of attribute references
     * @returns promise returning list of attribute references.
     * It can be one of the input attributes or another attribute(s)
     * that connects the input attributes in the data model.
     */
    getCommonAttributes(attributeRefs: ObjRef[]): Promise<ObjRef[]>;

    /**
     * Request the "center of star" for multiple series of attributes.
     *
     * @param attributesRefsBatch - input batch of list of attribute references
     * @returns promise returning batch of attribute references.
     */
    getCommonAttributesBatch(attributesRefsBatch: ObjRef[][]): Promise<ObjRef[][]>;

    /**
     * Gets the list of metadata of attribute display form with the provided list of uris or identifiers. (list of object refs)
     *
     * @param refs - list of refs of the attribute display form to retrieve.
     * @returns promise of list of attribute display form metadata object.
     */
    getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]>;

    /**
     * Gets the list of metadata of attribute with the provided list of uris. (list of object refs)
     *
     * @param refs - list of refs of the attribute to retrieve.
     * @returns promise of list of attribute metadata object.
     */
    getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]>;
}
