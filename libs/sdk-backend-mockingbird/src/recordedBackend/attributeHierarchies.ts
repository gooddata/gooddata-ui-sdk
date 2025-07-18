// (C) 2023-2025 GoodData Corporation
import { IAttributeHierarchiesService, NotSupported } from "@gooddata/sdk-backend-spi";
import { ICatalogAttributeHierarchy, IDateHierarchyTemplate, ObjRef } from "@gooddata/sdk-model";

import { RecordedBackendConfig } from "./types.js";

/**
 * @internal
 */
export default class RecordedAttributeHierarchiesService implements IAttributeHierarchiesService {
    private readonly config: RecordedBackendConfig = {};

    constructor(config: RecordedBackendConfig) {
        this.config = config;
    }

    public getValidDescendants(attributes: ObjRef[]): Promise<ObjRef[]> {
        if (this.config.getValidDescendants) {
            return Promise.resolve(this.config.getValidDescendants(attributes));
        }

        throw new NotSupported("not supported");
    }

    public createAttributeHierarchy(
        _title: string,
        _attributes: ObjRef[],
    ): Promise<ICatalogAttributeHierarchy> {
        throw new NotSupported("not supported");
    }

    public deleteAttributeHierarchy(_attributeHierarchyId: string): Promise<void> {
        throw new NotSupported("not supported");
    }

    public updateAttributeHierarchy(
        _catalogAttributeHierarchy: ICatalogAttributeHierarchy,
    ): Promise<ICatalogAttributeHierarchy> {
        throw new NotSupported("not supported");
    }

    getDateHierarchyTemplates(): Promise<IDateHierarchyTemplate[]> {
        throw new NotSupported("not supported");
    }
}
