// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IElementsQueryFactory } from "./elements";
import { IAttributeDisplayFormMetadataObject, IAttributeMetadataObject } from "../fromModel/ldm/metadata";

/**
 * Service for querying additional attributes and attribute display forms data, and their elements.
 * If you want to query attributes themselves, use catalog {@link IWorkspaceCatalogFactory}
 *
 * @public
 */
export interface IWorkspaceAttributesService {
    /**
     * Returns service that can be used to query attribute elements for attributes defined in this workspace. For
     * instance if workspace has data set Employee with attribute Name, then this service can be used to retrieve
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
     * Gets the list of metadata of attribute display form with the provided list of uris or identifiers. (list of object refs)
     *
     * @param refs - list of refs of the attribute display form to retrieve.
     * @returns promise of list of attribute display form metadata object.
     */
    getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]>;

    /**
     * Gets metadata of the attribute
     * @param ref - ref of the attribute to retrieve
     * @returns promise of attribute metadata object
     */
    getAttribute(ref: ObjRef): Promise<IAttributeMetadataObject>;

    /**
     * Gets the list of metadata of attribute with the provided list of uris. (list of object refs)
     *
     * @param refs - list of refs of the attribute to retrieve.
     * @returns promise of list of attribute metadata object.
     */
    getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]>;

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
}
