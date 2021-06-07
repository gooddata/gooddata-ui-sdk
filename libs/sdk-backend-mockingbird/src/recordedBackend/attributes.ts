// (C) 2019-2021 GoodData Corporation

import {
    IWorkspaceAttributesService,
    IElementsQueryFactory,
    UnexpectedResponseError,
    NotSupported,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    isCatalogAttribute,
    IMetadataObject,
} from "@gooddata/sdk-backend-spi";
import { RecordingIndex } from "./types";
import { RecordedElementQueryFactory } from "./elements";
import { ObjRef, areObjRefsEqual, objRefToString, isIdentifierRef } from "@gooddata/sdk-model";
import { newAttributeMetadataObject } from "@gooddata/sdk-backend-base";
import values from "lodash/values";

/**
 * @internal
 */
export class RecordedAttributes implements IWorkspaceAttributesService {
    constructor(private recordings: RecordingIndex) {}

    public elements(): IElementsQueryFactory {
        return new RecordedElementQueryFactory(this.recordings);
    }

    public async getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> {
        if (!this.recordings.metadata || !this.recordings.metadata.displayForms) {
            throw new UnexpectedResponseError("No displayForm recordings", 404, {});
        }

        const recording = values(this.recordings.metadata.displayForms).find((rec) =>
            isIdentifierRef(ref) ? ref.identifier === rec.obj.id : ref.uri === rec.obj.uri,
        );

        if (!recording) {
            throw new UnexpectedResponseError(`No element recordings for df ${objRefToString(ref)}`, 404, {});
        }

        return recording.obj;
    }

    public async getAttribute(ref: ObjRef): Promise<IAttributeMetadataObject> {
        if (!this.recordings.metadata || !this.recordings.metadata.catalog) {
            throw new UnexpectedResponseError("No recordings", 404, {});
        }

        const recording = this.recordings.metadata.catalog.items
            .filter(isCatalogAttribute)
            .find((wrappedAttribute) => {
                return areObjRefsEqual(ref, wrappedAttribute.attribute.ref);
            });

        if (!recording) {
            throw new UnexpectedResponseError(`No attribute recording ${objRefToString(ref)}`, 404, {});
        }

        const { title, uri, id, production, description } = recording.attribute;
        return newAttributeMetadataObject(ref, (a) =>
            a.title(title).uri(uri).production(Boolean(production)).id(id).description(description),
        );
    }

    public getCommonAttributes(): Promise<ObjRef[]> {
        throw new NotSupported("not supported");
    }
    public getCommonAttributesBatch(): Promise<ObjRef[][]> {
        throw new NotSupported("not supported");
    }

    public getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]> {
        const loader = this.getAttributeDisplayForm.bind(this);
        return Promise.all(refs.map(loader));
    }

    public getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]> {
        const loader = this.getAttribute.bind(this);
        return Promise.all(refs.map(loader));
    }

    public getAttributeDatasetMeta(_: ObjRef): Promise<IMetadataObject> {
        throw new NotSupported("not supported");
    }
}
