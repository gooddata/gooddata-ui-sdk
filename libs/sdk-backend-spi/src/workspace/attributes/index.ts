// (C) 2019-2022 GoodData Corporation
import {
    ObjRef,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IMetadataObject,
} from "@gooddata/sdk-model";
import { IElementsQueryFactory } from "./elements/index.js";

/**
 * Service for querying additional attributes and attribute display forms data, and their elements.
 *
 * @remarks
 * If you want to query attributes themselves, use catalog {@link IWorkspaceCatalogFactory}
 *
 * @public
 */
export interface IWorkspaceAttributesService {
    /**
     * Returns service that can be used to query attribute elements for attributes defined in this workspace.
     *
     * @remarks
     * For instance if workspace has data set Employee with attribute Name, then this service can be used to retrieve
     * names of all employees.
     */
    elements(): IElementsQueryFactory;

    /**
     * Gets the attribute display form with the provided identifier.
     * @param ref - ref of the attribute display form to retrieve
     * @returns promise of attribute display form metadata object
     */
    getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject>;

    /**
     * Gets the list of metadata of attribute display form with the provided list of uris or identifiers. (list of object refs).
     *
     * @remarks
     * If a display form referenced by any of the refs does not exist, then the call must not fail and instead return only
     * those display forms that exist.
     *
     * @param refs - list of refs of the attribute display form to retrieve.
     * @returns promise of list of attribute display form metadata object.
     */
    getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]>;

    /**
     * Gets metadata of the attribute for particular display form reference.
     *
     * @param ref - ref of the display form to retrieve attribute for
     * @returns promise of attribute metadata object
     */
    getAttributeByDisplayForm(ref: ObjRef): Promise<IAttributeMetadataObject>;

    /**
     * Gets metadata of the attribute.
     *
     * @param ref - ref of the attribute to retrieve
     * @returns promise of attribute metadata object
     */
    getAttribute(ref: ObjRef): Promise<IAttributeMetadataObject>;

    /**
     * Gets the list of metadata of attribute with the provided list of uris. (list of object refs)
     *
     * @remarks
     * If a display form referenced by any of the refs does not exist, then the call must not fail and instead return only
     * those display forms that exist.
     *
     * @param refs - list of refs of the attribute to retrieve.
     * @returns promise of list of attribute metadata object.
     */
    getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]>;

    /**
     * Request list of attributes that are "center of star" for the input attributes in the data model.
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
     * Get information about the given attribute's dataset
     * @param ref - ref of the attribute
     * @returns promise of metadata object
     */
    getAttributeDatasetMeta(ref: ObjRef): Promise<IMetadataObject>;
}
