// (C) 2023 GoodData Corporation
import { type IAttributeHierarchiesService, NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type ICatalogAttributeHierarchy,
    type IDateHierarchyTemplate,
    type ObjRef,
} from "@gooddata/sdk-model";

import { type RecordedBackendConfig } from "./types.js";

/**
 * @internal
 */
export class RecordedAttributeHierarchiesService implements IAttributeHierarchiesService {
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
