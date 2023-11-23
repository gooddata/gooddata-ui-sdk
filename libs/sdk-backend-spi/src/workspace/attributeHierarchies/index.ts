// (C) 2023 GoodData Corporation
import { ICatalogAttributeHierarchy, ObjRef } from "@gooddata/sdk-model";

/**
 * Service for handle workspace attribute hierarchies
 *
 * @alpha
 */
export interface IAttributeHierarchiesService {
    /**
     * Creates attribute hierarchy
     */
    createAttributeHierarchy(title: string, attributes: ObjRef[]): Promise<ICatalogAttributeHierarchy>;

    /**
     * Updates attribute hierarchy
     */
    updateAttributeHierarchy(
        catalogAttributeHierarchy: ICatalogAttributeHierarchy,
    ): Promise<ICatalogAttributeHierarchy>;

    /**
     * Deletes attribute hierarchy
     */
    deleteAttributeHierarchy(attributeHierarchyId: string): Promise<void>;

    /**
     * Gets valid descendants for given attributes
     */
    getValidDescendants(attributes: ObjRef[]): Promise<ObjRef[]>;
}
