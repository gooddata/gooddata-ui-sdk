// (C) 2007-2022 GoodData Corporation
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IElementsQueryFactory,
    IMetadataObject,
    IWorkspaceAttributesService,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { DecoratedWorkspaceAttributesService } from "../decoratedBackend/attributes";
import { WithElementsQueryFactoryEventing } from "./elements";
import { AnalyticalBackendCallbacks } from "./types";

export class WithAttributesEventing extends DecoratedWorkspaceAttributesService {
    constructor(
        decorated: IWorkspaceAttributesService,
        private readonly callbacks: AnalyticalBackendCallbacks,
    ) {
        super(decorated);
    }

    public elements(): IElementsQueryFactory {
        return new WithElementsQueryFactoryEventing(this.decorated.elements(), this.callbacks);
    }

    public async getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> {
        const attributeDisplayForm = await super.getAttributeDisplayForm(ref);
        this.callbacks?.attributes?.attributeDisplayFormSuccess?.(attributeDisplayForm);
        return attributeDisplayForm;
    }

    public async getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]> {
        const attributeDisplayForms = await super.getAttributeDisplayForms(refs);
        this.callbacks?.attributes?.attributeDisplayFormsSuccess?.(attributeDisplayForms);
        return attributeDisplayForms;
    }

    public async getAttribute(ref: ObjRef): Promise<IAttributeMetadataObject> {
        const attribute = await super.getAttribute(ref);
        this.callbacks?.attributes?.attributeSuccess?.(attribute);
        return attribute;
    }

    public async getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]> {
        const attributes = await super.getAttributes(refs);
        this.callbacks?.attributes?.attributesSuccess?.(attributes);
        return attributes;
    }

    public async getCommonAttributes(attributeRefs: ObjRef[]): Promise<ObjRef[]> {
        const commonAttributes = await super.getCommonAttributes(attributeRefs);
        this.callbacks?.attributes?.commonAttributesSuccess?.(commonAttributes);
        return commonAttributes;
    }

    public async getCommonAttributesBatch(attributesRefsBatch: ObjRef[][]): Promise<ObjRef[][]> {
        const commonAttributesBatch = await super.getCommonAttributesBatch(attributesRefsBatch);
        this.callbacks?.attributes?.commonAttributesBatchSuccess?.(commonAttributesBatch);
        return commonAttributesBatch;
    }

    public async getAttributeDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        const attributeDatasetMeta = await super.getAttributeDatasetMeta(ref);
        this.callbacks?.attributes?.attributeDatasetMetaSuccess?.(attributeDatasetMeta);
        return attributeDatasetMeta;
    }
}
