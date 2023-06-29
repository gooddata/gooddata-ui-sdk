// (C) 2019-2022 GoodData Corporation
import { GdcMetadata } from "@gooddata/api-model-bear";
import {
    UriRef,
    ObjRef,
    uriRef,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IMetadataObject,
} from "@gooddata/sdk-model";
import {
    newAttributeDisplayFormMetadataObject,
    newAttributeMetadataObject,
} from "@gooddata/sdk-backend-base";
import { invariant } from "ts-invariant";

import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { objRefToUri, objRefsToUris, getObjectIdFromUri } from "../../../utils/api.js";
import { convertMetadataObjectXrefEntry } from "../../../convertors/fromBackend/MetaConverter.js";

import { BearWorkspaceElements } from "./elements/index.js";
import {
    IElementsQueryFactory,
    IWorkspaceAttributesService,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";

export class BearWorkspaceAttributes implements IWorkspaceAttributesService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public elements = (): IElementsQueryFactory => {
        return new BearWorkspaceElements(this.authCall, this.workspace);
    };

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        const displayFormUri = await objRefToUri(ref, this.workspace, this.authCall);
        const wrappedDisplayForm: GdcMetadata.IWrappedAttributeDisplayForm = await this.authCall((sdk) =>
            sdk.md.getObjectDetails(displayFormUri),
        );
        const displayFormDetails = wrappedDisplayForm.attributeDisplayForm;

        return this.buildAttributeDisplayForm(displayFormDetails);
    };

    public getAttribute = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        const attributeUri = await objRefToUri(ref, this.workspace, this.authCall);
        const wrappedAttribute: GdcMetadata.IWrappedAttribute = await this.authCall((sdk) =>
            sdk.md.getObjectDetails(attributeUri),
        );
        return this.buildAttribute(wrappedAttribute.attribute);
    };

    public async getCommonAttributes(attributesRefs: ObjRef[]): Promise<ObjRef[]> {
        const inputAttributeUris = await objRefsToUris(attributesRefs, this.workspace, this.authCall);
        const returnAttributeUris = await this.authCall((sdk) =>
            sdk.ldm.getCommonAttributes(this.workspace, inputAttributeUris),
        );
        return returnAttributeUris.map(uriRef);
    }

    public getCommonAttributesBatch(attributesRefsBatch: ObjRef[][]): Promise<ObjRef[][]> {
        return Promise.all(
            attributesRefsBatch.map(async (attributeRefs) => {
                return this.getCommonAttributes(attributeRefs);
            }),
        );
    }

    public async getAttributeByDisplayForm(ref: ObjRef): Promise<IAttributeMetadataObject> {
        const displayFormUri = await objRefToUri(ref, this.workspace, this.authCall);
        const wrappedDisplayForm: GdcMetadata.IWrappedAttributeDisplayForm = await this.authCall((sdk) =>
            sdk.md.getObjectDetails(displayFormUri),
        );
        const wrappedAttribute: GdcMetadata.IWrappedAttribute = await this.authCall((sdk) =>
            sdk.md.getObjectDetails(wrappedDisplayForm.attributeDisplayForm.content.formOf),
        );
        return this.buildAttribute(wrappedAttribute.attribute);
    }

    public getAttributeDisplayForms = async (
        refs: ObjRef[],
    ): Promise<IAttributeDisplayFormMetadataObject[]> => {
        const displayFormUris = await objRefsToUris(refs, this.workspace, this.authCall, false);
        const wrappedAttributeDisplayForms: GdcMetadata.IWrappedAttributeDisplayForm[] = await this.authCall(
            (sdk) =>
                sdk.md.getObjects<GdcMetadata.IWrappedAttributeDisplayForm>(this.workspace, displayFormUris),
        );

        return wrappedAttributeDisplayForms.map(
            (wrappedDisplayForm: GdcMetadata.IWrappedAttributeDisplayForm) => {
                if (!GdcMetadata.isWrappedAttributeDisplayForm(wrappedDisplayForm)) {
                    throw new UnexpectedError(
                        "INVALID_REFERENCED_OBJECT",
                        new Error("Referenced object is not attributeDisplayForm"),
                    );
                }

                const displayFormDetails = wrappedDisplayForm.attributeDisplayForm;
                return this.buildAttributeDisplayForm(displayFormDetails);
            },
        );
    };

    public getAttributes = async (refs: ObjRef[]): Promise<IAttributeMetadataObject[]> => {
        const attributeUris = await objRefsToUris(refs, this.workspace, this.authCall, false);
        const wrappedAttributes = await this.authCall((sdk) =>
            sdk.md.getObjects<GdcMetadata.IWrappedAttribute>(this.workspace, attributeUris),
        );

        return wrappedAttributes.map(
            (wrappedAttribute: GdcMetadata.IWrappedAttribute): IAttributeMetadataObject => {
                const {
                    meta: { title, uri, isProduction, identifier, summary },
                    content: { displayForms },
                } = wrappedAttribute.attribute;
                const ref = uriRef(uri!);
                const attributeDisplayForms = displayForms.map((displayForm) =>
                    this.buildAttributeDisplayForm(displayForm),
                );

                return newAttributeMetadataObject(ref, (attribute) =>
                    attribute
                        .title(title)
                        .uri(uri!)
                        .production(Boolean(isProduction))
                        .id(identifier!)
                        .description(summary!)
                        .displayForms(attributeDisplayForms),
                );
            },
        );
    };

    private buildAttributeDisplayForm = (
        displayFormDetails: GdcMetadata.IAttributeDisplayForm,
    ): IAttributeDisplayFormMetadataObject => {
        const {
            meta: { title, summary, identifier, uri },
            content: { formOf, default: defaultDisplayForm, type },
        } = displayFormDetails;
        const ref: UriRef = uriRef(uri!);
        const isDefaultDf = defaultDisplayForm === 1;
        return newAttributeDisplayFormMetadataObject(ref, (df) =>
            df
                .attribute(uriRef(formOf))
                .title(title)
                .description(summary!)
                .isDefault(isDefaultDf)
                .id(identifier!)
                .uri(uri!)
                .displayFormType(type),
        );
    };

    private buildAttribute = (attributeDetails: GdcMetadata.IAttribute): IAttributeMetadataObject => {
        const { title, uri, isProduction, identifier, summary } = attributeDetails.meta;
        const { displayForms } = attributeDetails.content;
        const attributeDisplayForms = displayForms.map((displayForm) =>
            this.buildAttributeDisplayForm(displayForm),
        );
        const ref: UriRef = uriRef(uri!);
        return newAttributeMetadataObject(ref, (a) =>
            a
                .title(title)
                .uri(uri!)
                .production(Boolean(isProduction))
                .id(identifier!)
                .description(summary!)
                .displayForms(attributeDisplayForms),
        );
    };

    public async getAttributeDatasetMeta(ref: ObjRef): Promise<IMetadataObject> {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const objectId = getObjectIdFromUri(uri);

        return this.authCall(async (sdk) => {
            const usedBy = await sdk.xhr.getParsed<{ entries: GdcMetadata.IObjectXrefEntry[] }>(
                `/gdc/md/${this.workspace}/usedby2/${objectId}?types=dataSet`,
            );

            invariant(usedBy.entries.length > 0, "Attribute must have a dataset associated to it.");

            return convertMetadataObjectXrefEntry("dataSet", usedBy.entries[0]);
        });
    }
}
