// (C) 2021-2022 GoodData Corporation
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IMetadataObject,
    ObjRef,
} from "@gooddata/sdk-model";
import { IElementsQueryFactory, IWorkspaceAttributesService } from "@gooddata/sdk-backend-spi";

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
