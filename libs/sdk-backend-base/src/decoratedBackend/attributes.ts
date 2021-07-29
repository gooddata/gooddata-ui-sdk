// (C) 2021 GoodData Corporation

import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IElementsQueryFactory,
    IMetadataObject,
    IWorkspaceAttributesService,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceAttributesService implements IWorkspaceAttributesService {
    protected constructor(protected decorated: IWorkspaceAttributesService) {}

    elements(): IElementsQueryFactory {
        return this.decorated.elements();
    }

    getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> {
        return this.decorated.getAttributeDisplayForm(ref);
    }

    getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]> {
        return this.decorated.getAttributeDisplayForms(refs);
    }

    getAttribute(ref: ObjRef): Promise<IAttributeMetadataObject> {
        return this.decorated.getAttribute(ref);
    }

    getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]> {
        return this.decorated.getAttributes(refs);
    }

    getCommonAttributes(attributeRefs: ObjRef[]): Promise<ObjRef[]> {
        return this.decorated.getCommonAttributes(attributeRefs);
    }

    getCommonAttributesBatch(attributesRefsBatch: ObjRef[][]): Promise<ObjRef[][]> {
        return this.decorated.getCommonAttributesBatch(attributesRefsBatch);
    }

    getAttributeDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        return this.decorated.getAttributeDatasetMeta(ref);
    }
}
