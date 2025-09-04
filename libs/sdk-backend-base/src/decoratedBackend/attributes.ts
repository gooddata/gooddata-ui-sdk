// (C) 2021-2025 GoodData Corporation

import {
    IAttributeWithReferences,
    IAttributesQuery,
    IElementsQueryFactory,
    IWorkspaceAttributesService,
} from "@gooddata/sdk-backend-spi";
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IMetadataObject,
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    ObjRef,
} from "@gooddata/sdk-model";

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

    public updateAttributeMeta(
        updatedAttribute: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IAttributeMetadataObject> {
        return this.decorated.updateAttributeMeta(updatedAttribute);
    }

    public getAttributeByDisplayForm(ref: ObjRef): Promise<IAttributeMetadataObject> {
        return this.decorated.getAttributeByDisplayForm(ref);
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

    public getAttributesWithReferences(refs: ObjRef[]): Promise<IAttributeWithReferences[]> {
        return this.decorated.getAttributesWithReferences(refs);
    }

    public getConnectedAttributesByDisplayForm(ref: ObjRef): Promise<ObjRef[]> {
        return this.decorated.getConnectedAttributesByDisplayForm(ref);
    }

    public getAttributesQuery(): IAttributesQuery {
        return this.decorated.getAttributesQuery();
    }
}
