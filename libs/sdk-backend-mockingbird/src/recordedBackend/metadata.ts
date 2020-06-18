// (C) 2019-2020 GoodData Corporation

import { IWorkspaceMetadata, UnexpectedResponseError, NotSupported } from "@gooddata/sdk-backend-spi";
import {
    IAttributeDisplayFormMetadataObject,
    isUriRef,
    ObjRef,
    IMeasureExpressionToken,
    IMetadataObject,
    IAttributeMetadataObject,
    isCatalogAttribute,
    newAttributeMetadataObject,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import { RecordingIndex } from "./types";
import { identifierToRecording } from "./utils";

/**
 * @internal
 */
export class RecordedMetadata implements IWorkspaceMetadata {
    constructor(private readonly recordings: RecordingIndex) {}

    public getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> {
        if (!this.recordings.metadata || !this.recordings.metadata.displayForms) {
            return Promise.reject(new UnexpectedResponseError("No displayForm recordings", 404, {}));
        }

        if (isUriRef(ref)) {
            return Promise.reject(
                new UnexpectedResponseError("Identifying displayForm by uri is not supported yet", 400, {}),
            );
        }

        const recording = this.recordings.metadata.displayForms[
            "df_" + identifierToRecording(ref.identifier)
        ];

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

    public getMeasureExpressionTokens(_: ObjRef): Promise<IMeasureExpressionToken[]> {
        throw new NotSupported("not supported");
    }
    public getFactDatasetMeta(_: ObjRef): Promise<IMetadataObject> {
        throw new NotSupported("not supported");
    }
}
