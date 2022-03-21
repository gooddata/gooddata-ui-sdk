// (C) 2019-2022 GoodData Corporation

import {
    ITigerClient,
    JsonApiAttributeOutList,
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetOutWithLinks,
    JsonApiLabelLinkage,
    JsonApiLabelOutWithLinks,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { CatalogItem, ICatalogAttribute, ICatalogDateDataset } from "@gooddata/sdk-backend-spi";
import values from "lodash/values";
import {
    convertAttribute,
    convertDateAttribute,
    convertDateDataset,
} from "../../../convertors/fromBackend/CatalogConverter";
import { addRsqlFilterToParams } from "./rsqlFilter";

function lookupRelatedObject(
    included: (JsonApiLabelOutWithLinks | JsonApiDatasetOutWithLinks)[] | undefined,
    id: string,
    type: string,
) {
    if (!included) {
        return;
    }

    return included?.find((item) => item.type === type && item.id === id);
}

function getAttributeLabels(
    attribute: JsonApiAttributeOutWithLinks,
    included: (JsonApiLabelOutWithLinks | JsonApiDatasetOutWithLinks)[] | undefined,
): JsonApiLabelOutWithLinks[] {
    const labelsRefs = attribute.relationships?.labels?.data as JsonApiLabelLinkage[];
    return labelsRefs
        .map((ref) => {
            const obj = lookupRelatedObject(included, ref.id, ref.type);
            if (!obj) {
                return;
            }
            return obj as JsonApiLabelOutWithLinks;
        })
        .filter((obj): obj is JsonApiLabelOutWithLinks => obj !== undefined);
}

function isGeoLabel(label: JsonApiLabelOutWithLinks): boolean {
    /*
     * TODO: TIGER-HACK this is temporary way to identify labels with geo pushpin; normally this should be done
     *  using some indicator on the metadata object. for sakes of speed & after agreement with tiger team
     *  falling back to use of id convention.
     */
    return label.id.search(/^.*\.geo__/) > -1;
}

function createNonDateAttributes(attributes: JsonApiAttributeOutList): ICatalogAttribute[] {
    const nonDateAttributes = attributes.data.filter((attr) => attr.attributes?.granularity === undefined);

    return nonDateAttributes.map((attribute) => {
        const allLabels = getAttributeLabels(attribute, attributes.included);
        const geoLabels = allLabels.filter(isGeoLabel);
        // exactly one label is guaranteed to be primary
        const defaultLabel = allLabels.filter((label) => label.attributes!.primary)[0];

        return convertAttribute(attribute, defaultLabel, geoLabels, allLabels);
    });
}

type DatasetWithAttributes = {
    dataset: JsonApiDatasetOutWithLinks;
    attributes: JsonApiAttributeOutWithLinks[];
};

function identifyDateDatasets(
    dateAttributes: JsonApiAttributeOutWithLinks[],
    included: (JsonApiLabelOutWithLinks | JsonApiDatasetOutWithLinks)[] | undefined,
) {
    const datasets: { [id: string]: DatasetWithAttributes } = {};

    dateAttributes.forEach((attribute) => {
        const ref = attribute.relationships?.dataset?.data;
        if (!ref) {
            return;
        }
        const dataset = lookupRelatedObject(included, ref.id, ref.type) as JsonApiDatasetOutWithLinks;
        if (!dataset) {
            return;
        }
        const entry = datasets[ref.id];
        if (!entry) {
            datasets[ref.id] = {
                dataset,
                attributes: [attribute],
            };
        } else {
            entry.attributes.push(attribute);
        }
    });

    return values(datasets);
}

function createDateDatasets(attributes: JsonApiAttributeOutList): ICatalogDateDataset[] {
    const dateAttributes = attributes.data.filter((attr) => attr.attributes?.granularity !== undefined);
    const dateDatasets = identifyDateDatasets(dateAttributes, attributes.included);

    return dateDatasets.map((dd) => {
        const catalogDateAttributes = dd.attributes.map((attribute) => {
            const labels = getAttributeLabels(attribute, attributes.included);
            const defaultLabel = labels[0];

            return convertDateAttribute(attribute, defaultLabel, labels);
        });

        return convertDateDataset(dd.dataset, catalogDateAttributes);
    });
}

export async function loadAttributesAndDateDatasets(
    client: ITigerClient,
    workspaceId: string,
    rsqlFilter: string,
    loadAttributes?: boolean,
    loadDateDatasets?: boolean,
): Promise<CatalogItem[]> {
    const includeObjects = ["labels"];
    if (loadDateDatasets) {
        includeObjects.push("datasets");
    }
    const params = addRsqlFilterToParams({ workspaceId }, rsqlFilter);

    const attributes = await MetadataUtilities.getAllPagesOf(
        client,
        client.entities.getAllEntitiesAttributes,
        params,
        { query: { include: includeObjects.join(",") } },
    ).then(MetadataUtilities.mergeEntitiesResults);

    const catalogItems: CatalogItem[] = [];

    if (loadAttributes) {
        const nonDateAttributes = createNonDateAttributes(attributes);
        catalogItems.push(...nonDateAttributes);
    }
    if (loadDateDatasets) {
        const dateDatasets: CatalogItem[] = createDateDatasets(attributes);
        catalogItems.push(...dateDatasets);
    }

    return catalogItems;
}
