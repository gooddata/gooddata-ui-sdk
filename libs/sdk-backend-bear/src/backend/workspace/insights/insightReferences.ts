// (C) 2019-2022 GoodData Corporation

import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { IInsight, insightUri, CatalogItem, IMetadataObject } from "@gooddata/sdk-model";
import { IInsightReferences, InsightReferenceTypes } from "@gooddata/sdk-backend-spi";
import { GdcMetadata, GdcMetadataObject } from "@gooddata/api-model-bear";
import { getObjectIdFromUri } from "../../../utils/api.js";
import union from "lodash/union.js";
import { convertMetadataObject } from "../../../convertors/fromBackend/MetaConverter.js";
import flow from "lodash/flow.js";
import isEmpty from "lodash/isEmpty.js";
import values from "lodash/values.js";
import keyBy from "lodash/keyBy.js";
import flatMap from "lodash/fp/flatMap.js";
import uniqBy from "lodash/fp/uniqBy.js";

import {
    convertMetric,
    convertWrappedFact,
    convertWrappedAttribute,
} from "../../../convertors/fromBackend/CatalogConverter.js";

const objectTypeToObjectCategory = (type: InsightReferenceTypes): GdcMetadata.ObjectCategory => {
    switch (type) {
        case "displayForm":
            return "attributeDisplayForm";
        case "measure":
            return "metric";
        case "variable":
            return "prompt";
        default:
            return type;
    }
};

const objectTypesWithLinkToDataset: InsightReferenceTypes[] = ["fact", "attribute"];
const objectCategoriesWithLinkToDataset: GdcMetadata.ObjectCategory[] =
    objectTypesWithLinkToDataset.map(objectTypeToObjectCategory);

type BulkUsedByResponse = { useMany: { [idx: number]: { entries: GdcMetadata.IObjectXrefEntry[] } } };

/**
 * Given requested types, return types of objects that should be queried using 'using2' resource
 *
 * 1. When user wants data set info, then facts and attributes always must be queried
 * 2. When user wants attribute or display form, then both must be queried because they are needed
 *    for the CatalogItem
 */
function typesForXref(types: InsightReferenceTypes[]): InsightReferenceTypes[] {
    let enrichedTypes = types.includes("dataSet")
        ? union<InsightReferenceTypes>(types, objectTypesWithLinkToDataset)
        : types;

    if (types.includes("attribute") || types.includes("displayForm")) {
        enrichedTypes = union(enrichedTypes, ["attribute", "displayForm"]);
    }

    return enrichedTypes;
}

/**
 * Given requested types, return types of objects that should be loaded.
 *
 * When user wants attribute or display form, then both must be queried because they are needed for CatalogItem
 */
function typesForLoad(types: InsightReferenceTypes[]): InsightReferenceTypes[] {
    if (types.includes("attribute") || types.includes("displayForm")) {
        return union(types, ["attribute", "displayForm"]);
    }

    return types;
}

export class InsightReferencesQuery {
    private readonly objectId: string;
    private readonly typesForXref: InsightReferenceTypes[];
    private readonly typesForLoad: InsightReferenceTypes[];

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly insight: IInsight,
        private readonly requestedTypes: InsightReferenceTypes[],
    ) {
        const uri = insightUri(this.insight);
        this.objectId = getObjectIdFromUri(uri);
        this.typesForXref = typesForXref(this.requestedTypes);
        this.typesForLoad = typesForLoad(this.requestedTypes);
    }

    public run = async (): Promise<IInsightReferences> => {
        if (isEmpty(this.typesForXref)) {
            return {};
        }

        const xrefs: GdcMetadata.IObjectXrefEntry[] = await this.findReferencedObjects();

        /*
         * If dataSet information is needed, do one more call to find out to which data sets do the
         * different facts and attributes belong. Query resource cannot return dataSets because the relationship
         * to dataSets is in the 'opposite direction'.
         */
        if (this.requestedTypes.includes("dataSet")) {
            const datasets: GdcMetadata.IObjectXrefEntry[] = await this.findDatasets(xrefs);

            xrefs.push(...datasets);
        }

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
    private findReferencedObjects = async (): Promise<GdcMetadata.IObjectXrefEntry[]> => {
        const categories = this.typesForXref.map(objectTypeToObjectCategory);
        const { entries: allDirectObjects } = await this.authCall((sdk) =>
            sdk.xhr.getParsed<{ entries: GdcMetadata.IObjectXrefEntry[] }>(
                `/gdc/md/${this.workspace}/using2/${this.objectId}?types=${categories.join(",")}`,
            ),
        );

        return allDirectObjects;
    };

    /**
     * Given objects used by the insight, retrieve dataSets to which they belong. The usedBy2 is bulk mode
     * is used for this.
     */
    private findDatasets = async (
        objects: GdcMetadata.IObjectXrefEntry[],
    ): Promise<GdcMetadata.IObjectXrefEntry[]> => {
        // only some object types will have a reference to a dataSet, so no need to load other object types
        const uris = objects
            .filter((i) =>
                objectCategoriesWithLinkToDataset.includes(i.category as GdcMetadata.ObjectCategory),
            )
            .map((i) => i.link);

        const usedByPayload = {
            inUseMany: {
                uris,
                types: ["dataSet"],
                nearest: false,
            },
        };

        const datasetResponses = await this.authCall((sdk) => {
            return sdk.xhr.postParsed<BulkUsedByResponse>(`/gdc/md/${this.workspace}/usedby2`, {
                body: usedByPayload,
            });
        });

        return flow(
            flatMap((response: { entries: GdcMetadata.IObjectXrefEntry[] }) => response.entries),
            uniqBy((dataSet: GdcMetadata.IObjectXrefEntry) => dataSet.identifier),
        )(values(datasetResponses.useMany));
    };

    /**
     * Give the discovered references, bulk load data for objects of those types that the caller is interested in.
     */
    private loadObjects = async (
        xrefs: GdcMetadata.IObjectXrefEntry[],
    ): Promise<GdcMetadataObject.WrappedObject[]> => {
        const categories = this.typesForLoad.map(objectTypeToObjectCategory);
        const objectUrisToObtain = xrefs
            .filter((i) => categories.includes(i.category as GdcMetadata.ObjectCategory))
            .map((meta) => meta.link);

        return this.authCall((sdk) => sdk.md.getObjects(this.workspace, objectUrisToObtain));
    };

    //
    //
    //

    private createResult(objects: GdcMetadataObject.WrappedObject[]): IInsightReferences {
        const unwrappedObjects: GdcMetadataObject.IObject[] = objects.map(
            GdcMetadataObject.unwrapMetadataObject,
        );
        const convertedObjects = unwrappedObjects.map(convertMetadataObject);
        const wantDatasets = this.requestedTypes.includes("dataSet");

        if (this.requestedTypes.length === 1 && wantDatasets) {
            return {
                dataSetMeta: convertedObjects,
            };
        }

        const objectsByUri = keyBy(unwrappedObjects, (obj) => (obj as any).meta.uri);
        const catalogItems: CatalogItem[] = [];
        const dataSetMeta: IMetadataObject[] = [];

        convertedObjects.forEach((obj) => {
            const fullObject = objectsByUri[obj.uri];

            switch (obj.type) {
                case "displayForm":
                case "variable":
                    /*
                     * TODO: implement conversions in order to support these additional types;
                     *  attributeDf -> catalog item? or tis this reliably covered by "attribute" objects
                     *  variable -> ?? not catalog item, probably something else..
                     */
                    break;
                case "attribute":
                    catalogItems.push(
                        convertWrappedAttribute({ attribute: fullObject as GdcMetadata.IAttribute }),
                    );
                    break;
                case "fact":
                    catalogItems.push(convertWrappedFact({ fact: fullObject as GdcMetadata.IFact }));
                    break;
                case "measure":
                    catalogItems.push(convertMetric({ metric: fullObject as GdcMetadata.IMetric }));
                    break;
                case "dataSet":
                    dataSetMeta.push(obj);
                    break;
            }
        });

        const datasetProp = wantDatasets ? { dataSetMeta } : {};

        return {
            ...datasetProp,
            catalogItems,
        };
    }
}
