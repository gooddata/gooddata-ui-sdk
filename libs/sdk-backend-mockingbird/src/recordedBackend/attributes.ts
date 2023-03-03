// (C) 2019-2023 GoodData Corporation
import { RecordedBackendConfig, RecordingIndex } from "./types";
import { RecordedElementQueryFactory } from "./elements";
import {
    ObjRef,
    objRefToString,
    isCatalogAttribute,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IMetadataObject,
    isUriRef,
} from "@gooddata/sdk-model";
import { newAttributeMetadataObject } from "@gooddata/sdk-backend-base";
import values from "lodash/values";
import { objRefsToStringKey } from "./utils";
import compact from "lodash/compact";
import {
    IElementsQueryFactory,
    IWorkspaceAttributesService,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export class RecordedAttributes implements IWorkspaceAttributesService {
    constructor(private recordings: RecordingIndex, private config: RecordedBackendConfig) {}

    public elements(): IElementsQueryFactory {
        return new RecordedElementQueryFactory(this.recordings, this.config);
    }

    public getAttributeDisplayForm = async (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> => {
        if (!this.recordings.metadata?.displayForms) {
            throw new UnexpectedResponseError("No displayForm recordings", 404, {});
        }

        const recording = values(this.recordings.metadata.displayForms).find((rec) =>
            this.isObjWithRef(rec.obj, ref),
        );

        if (!recording) {
            throw new UnexpectedResponseError(`No element recordings for df ${objRefToString(ref)}`, 404, {});
        }

        return recording.obj;
    };

    public getAttribute = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        if (!this.recordings.metadata?.catalog) {
            throw new UnexpectedResponseError("No recordings", 404, {});
        }

        const recording = this.recordings.metadata.catalog.items
            .filter(isCatalogAttribute)
            .find((wrappedAttribute) => {
                return this.isObjWithRef(wrappedAttribute.attribute, ref);
            });

        if (!recording) {
            throw new UnexpectedResponseError(`No attribute recording ${objRefToString(ref)}`, 404, {});
        }

        return this.sanitizeAttribute(recording.attribute);
    };

    public getAttributeByDisplayForm = async (ref: ObjRef): Promise<IAttributeMetadataObject> => {
        if (!this.recordings.metadata?.catalog) {
            throw new UnexpectedResponseError("No recordings", 404, {});
        }

        const recording = this.recordings.metadata.catalog.items
            .filter(isCatalogAttribute)
            .find((wrappedAttribute) => {
                return wrappedAttribute.displayForms.some((df) => this.isObjWithRef(df, ref));
            });

        if (!recording) {
            throw new UnexpectedResponseError(`No attribute recording ${objRefToString(ref)}`, 404, {});
        }

        return this.sanitizeAttribute(recording.attribute);
    };

    public async getCommonAttributes(attributeRefs: ObjRef[]): Promise<ObjRef[]> {
        const key = objRefsToStringKey(attributeRefs);
        const response = this.config.getCommonAttributesResponses?.[key];

        if (!response) {
            throw new UnexpectedResponseError(`No common attributes response set for key ${key}`, 404, {});
        }

        return response;
    }

    public getCommonAttributesBatch(attributesRefsBatch: ObjRef[][]): Promise<ObjRef[][]> {
        return Promise.all(attributesRefsBatch.map((refs) => this.getCommonAttributes(refs)));
    }

    public getAttributeDisplayForms = async (
        refs: ObjRef[],
    ): Promise<IAttributeDisplayFormMetadataObject[]> => {
        // note: this is here to match the funky SPI contract; invalid refs are ignored
        const loader = (ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject | undefined> => {
            return this.getAttributeDisplayForm(ref).catch((_) => undefined);
        };

        return compact(await Promise.all(refs.map(loader)));
    };

    public getAttributes = async (refs: ObjRef[]): Promise<IAttributeMetadataObject[]> => {
        // note: this is here to match the funky SPI contract; invalid refs are ignored
        const loader = (ref: ObjRef): Promise<IAttributeMetadataObject | undefined> => {
            return this.getAttribute(ref).catch((_) => undefined);
        };

        return compact(await Promise.all(refs.map(loader)));
    };

    public async getAttributeDatasetMeta(displayFormRef: ObjRef): Promise<IMetadataObject> {
        const key = objRefToString(displayFormRef);
        const response = this.config.attributeDataSet?.[key];

        if (!response) {
            throw new UnexpectedResponseError(
                `No corresponding data set for attribute with key ${key}`,
                404,
                {},
            );
        }

        return response;
    }

    private sanitizeAttribute(attribute: IAttributeMetadataObject): IAttributeMetadataObject {
        const { ref, title, uri, id, production, description, displayForms } = attribute;
        return newAttributeMetadataObject(ref, (a) =>
            a
                .title(title)
                .uri(uri)
                .production(Boolean(production))
                .id(id)
                .description(description)
                .displayForms(displayForms),
        );
    }

    private isObjWithRef(obj: IMetadataObject, ref: ObjRef) {
        if (isUriRef(ref)) {
            return obj.uri === ref.uri;
        }

        return obj.id === ref.identifier;
    }
}
