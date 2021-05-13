// (C) 2019-2020 GoodData Corporation

import {
    IWorkspaceAttributesService,
    IElementsQueryFactory,
    UnexpectedResponseError,
    NotSupported,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    isCatalogAttribute,
} from "@gooddata/sdk-backend-spi";
import { RecordingIndex } from "./types";
import { RecordedElementQueryFactory } from "./elements";
import { isUriRef, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { identifierToRecording } from "./utils";
import { newAttributeMetadataObject } from "@gooddata/sdk-backend-base";

/**
 * @internal
 */
export class RecordedAttributes implements IWorkspaceAttributesService {
    constructor(private recordings: RecordingIndex) {}

    public elements(): IElementsQueryFactory {
        return new RecordedElementQueryFactory(this.recordings);
    }

    public getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> {
        if (!this.recordings.metadata || !this.recordings.metadata.displayForms) {
            return Promise.reject(new UnexpectedResponseError("No displayForm recordings", 404, {}));
        }

        if (isUriRef(ref)) {
            return Promise.reject(
                new UnexpectedResponseError("Identifying displayForm by uri is not supported yet", 400, {}),
            );
        }

        const recording =
            this.recordings.metadata.displayForms["df_" + identifierToRecording(ref.identifier)];

        if (!recording) {
            return Promise.reject(
                new UnexpectedResponseError(`No element recordings for df ${ref.identifier}`, 404, {}),
            );
        }

        return Promise.resolve(recording.obj);
    }

    public getAttribute(ref: ObjRef): Promise<IAttributeMetadataObject> {
        if (!this.recordings.metadata || !this.recordings.metadata.catalog) {
            return Promise.reject(new UnexpectedResponseError("No recordings", 404, {}));
        }

        const recording = this.recordings.metadata.catalog.items
            .filter(isCatalogAttribute)
            .find((wrappedAttribute) => {
                return areObjRefsEqual(ref, wrappedAttribute.attribute.ref);
            });

        if (!recording) {
            return Promise.reject(
                new UnexpectedResponseError(`No attribute recording ${JSON.stringify(ref)}`, 404, {}),
            );
        }

        const { title, uri, id, production, description } = recording.attribute;
        return Promise.resolve(
            newAttributeMetadataObject(ref, (a) =>
                a.title(title).uri(uri).production(Boolean(production)).id(id).description(description),
            ),
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
}
