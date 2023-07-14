// (C) 2019-2022 GoodData Corporation

import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { IWidgetReferences, SupportedWidgetReferenceTypes } from "@gooddata/sdk-backend-spi";
import { CatalogItem, IWidget, widgetUri } from "@gooddata/sdk-model";
import { getObjectIdFromUri } from "../../../utils/api.js";
import { convertMetadataObject } from "../../../convertors/fromBackend/MetaConverter.js";
import isEmpty from "lodash/isEmpty.js";
import keyBy from "lodash/keyBy.js";

import { convertMetric } from "../../../convertors/fromBackend/CatalogConverter.js";
import {
    IMetric,
    IObject,
    IObjectXrefEntry,
    ObjectCategory,
    WrappedObject,
    unwrapMetadataObject,
} from "@gooddata/api-model-bear";

const objectTypeToObjectCategory = (type: SupportedWidgetReferenceTypes): ObjectCategory => {
    if (type === "measure") {
        return "metric";
    }
    return type;
};

export class WidgetReferencesQuery {
    private readonly objectId: string;
    private readonly typesForXref: SupportedWidgetReferenceTypes[];
    private readonly typesForLoad: SupportedWidgetReferenceTypes[];

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly widget: IWidget,
        private readonly requestedTypes: SupportedWidgetReferenceTypes[],
    ) {
        const uri = widgetUri(this.widget);
        this.objectId = getObjectIdFromUri(uri);
        this.typesForXref = this.requestedTypes;
        this.typesForLoad = this.requestedTypes;
    }

    public run = async (): Promise<IWidgetReferences> => {
        if (isEmpty(this.typesForXref)) {
            return {};
        }

        const xrefs: IObjectXrefEntry[] = await this.findReferencedObjects();

        /*
         * Xrefs do not contain all the necessary information. Load the referenced objects.
         */
        const objects = await this.loadObjects(xrefs);

        return this.createResult(objects);
    };

    //
    //
    //

    /**
     * Uses the query resource to obtain all objects of the desired types which are used by the insight.
     */
    private findReferencedObjects = async (): Promise<IObjectXrefEntry[]> => {
        const categories = this.typesForXref.map(objectTypeToObjectCategory);
        const { entries: allDirectObjects } = await this.authCall((sdk) =>
            sdk.xhr.getParsed<{ entries: IObjectXrefEntry[] }>(
                `/gdc/md/${this.workspace}/using2/${this.objectId}?types=${categories.join(",")}`,
            ),
        );

        return allDirectObjects;
    };

    /**
     * Give the discovered references, bulk load data for objects of those types that the caller is interested in.
     */
    private loadObjects = async (xrefs: IObjectXrefEntry[]): Promise<WrappedObject[]> => {
        const categories = this.typesForLoad.map(objectTypeToObjectCategory);
        const objectUrisToObtain = xrefs
            .filter((i) => categories.includes(i.category as ObjectCategory))
            .map((meta) => meta.link);

        return this.authCall((sdk) => sdk.md.getObjects(this.workspace, objectUrisToObtain));
    };

    //
    //
    //

    private createResult(objects: WrappedObject[]): IWidgetReferences {
        const unwrappedObjects: IObject[] = objects.map(unwrapMetadataObject);
        const convertedObjects = unwrappedObjects.map(convertMetadataObject);

        const objectsByUri = keyBy(unwrappedObjects, (obj) => (obj as any).meta.uri);
        const catalogItems: CatalogItem[] = [];

        convertedObjects.forEach((obj) => {
            const fullObject = objectsByUri[obj.uri];

            if (obj.type === "measure") {
                catalogItems.push(convertMetric({ metric: fullObject as IMetric }));
            }
        });

        return {
            catalogItems,
        };
    }
}
