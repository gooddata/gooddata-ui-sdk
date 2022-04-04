// (C) 2021-2022 GoodData Corporation

import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    ICatalogAttribute,
    IElementsQueryFactory,
    IMetadataObject,
    IWorkspaceAttributesService,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceAttributesService implements IWorkspaceAttributesService {
    protected constructor(protected readonly decorated: IWorkspaceAttributesService) {}

    public elements(): IElementsQueryFactory {
        return this.decorated.elements();
    }

    public getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> {
        return this.decorated.getAttributeDisplayForm(ref);
    }

    public getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]> {
        return this.decorated.getAttributeDisplayForms(refs);
    }

    public getAttribute(ref: ObjRef): Promise<IAttributeMetadataObject> {
        return this.decorated.getAttribute(ref);
    }

    public getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]> {
        return this.decorated.getAttributes(refs);
    }

    public getCatalogAttributes(refs: ObjRef[]): Promise<ICatalogAttribute[]> {
        return this.decorated.getCatalogAttributes(refs);
    }

    public getCommonAttributes(attributeRefs: ObjRef[]): Promise<ObjRef[]> {
        return this.decorated.getCommonAttributes(attributeRefs);
    }

    public getCommonAttributesBatch(attributesRefsBatch: ObjRef[][]): Promise<ObjRef[][]> {
        return this.decorated.getCommonAttributesBatch(attributesRefsBatch);
    }

    public getAttributeDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        return this.decorated.getAttributeDatasetMeta(ref);
    }
}
