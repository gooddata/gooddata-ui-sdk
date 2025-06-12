// (C) 2019-2025 GoodData Corporation

import {
    EntitiesApiGetAllEntitiesAttributesRequest,
    ITigerClient,
    JsonApiAttributeOutList,
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetOutWithLinks,
    JsonApiLabelLinkage,
    JsonApiLabelOutWithLinks,
    MetadataUtilities,
    JsonApiLabelOutAttributesValueTypeEnum,
    JsonApiAttributeOutIncludes,
    JsonApiAttributeHierarchyOutWithLinks,
    JsonApiDatasetLinkage,
} from "@gooddata/api-client-tiger";
import {
    CatalogItem,
    ICatalogAttribute,
    ICatalogAttributeHierarchy,
    ICatalogDateDataset,
} from "@gooddata/sdk-model";
import values from "lodash/values.js";
import {
    convertAttribute,
    convertDateAttribute,
    convertDateDataset,
} from "../../../convertors/fromBackend/CatalogConverter.js";
import { addRsqlFilterToParams } from "./rsqlFilter.js";
import { convertAttributeHierarchy } from "../../../convertors/fromBackend/HierarchyConverter.js";

function lookupRelatedObject(included: JsonApiAttributeOutIncludes[] | undefined, id: string, type: string) {
    if (!included) {
        return;
    }

    return included?.find((item) => item.type === type && item.id === id);
}

function getAttributeLabels(
    attribute: JsonApiAttributeOutWithLinks,
    included: JsonApiAttributeOutIncludes[] | undefined,
): JsonApiLabelOutWithLinks[] {
    if (!included) {
        return [];
    }
    const labelsRefs = (attribute.relationships?.labels?.data ?? []) as JsonApiLabelLinkage[];
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

function getAttributeDataSet(
    attribute: JsonApiAttributeOutWithLinks,
    included: JsonApiAttributeOutIncludes[] | undefined,
): JsonApiDatasetOutWithLinks | undefined {
    const dataSetRef = attribute.relationships?.dataset?.data as JsonApiDatasetLinkage;
    if (!dataSetRef || !included) {
        return;
    }
    return lookupRelatedObject(included, dataSetRef.id, dataSetRef.type) as JsonApiDatasetOutWithLinks;
}

function isGeoLabel(label: JsonApiLabelOutWithLinks): boolean {
    const type = label.attributes?.valueType;

    return (
        type === JsonApiLabelOutAttributesValueTypeEnum.GEO ||
        type === JsonApiLabelOutAttributesValueTypeEnum.GEO_LATITUDE ||
        type === JsonApiLabelOutAttributesValueTypeEnum.GEO_LONGITUDE
    );
}

function createNonDateAttributes(attributes: JsonApiAttributeOutList): ICatalogAttribute[] {
    const nonDateAttributes = attributes.data.filter((attr) => attr.attributes?.granularity === undefined);

    return nonDateAttributes.map((attribute) => {
        const allLabels = getAttributeLabels(attribute, attributes.included);
        const dataSet = getAttributeDataSet(attribute, attributes.included);
        const geoLabels = allLabels.filter(isGeoLabel);

        const defaultView = attribute.relationships?.defaultView?.data;
        const defaultViewLabel = defaultView && allLabels.find((label) => label.id === defaultView.id);
        // use the defaultView if available, fall back to primary: exactly one label is guaranteed to be primary
        const defaultLabel = defaultViewLabel ?? allLabels.filter((label) => label.attributes!.primary)[0];

        return convertAttribute(attribute, defaultLabel, geoLabels, allLabels, dataSet);
    });
}

type DatasetWithAttributes = {
    dataset: JsonApiDatasetOutWithLinks;
    attributes: JsonApiAttributeOutWithLinks[];
};

function identifyDateDatasets(
    dateAttributes: JsonApiAttributeOutWithLinks[],
    included: JsonApiAttributeOutIncludes[] | undefined,
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

    return dateDatasets
        .map((dd) => {
            const catalogDateAttributes = dd.attributes.map((attribute) => {
                const labels = getAttributeLabels(attribute, attributes.included);
                const defaultLabel = labels[0];

                return convertDateAttribute(attribute, defaultLabel, labels);
            });

            return convertDateDataset(dd.dataset, catalogDateAttributes);
        })
        .sort((a, b) => a.dataSet.title.localeCompare(b.dataSet.title));
}

function createAttributeHierarchies(attributes: JsonApiAttributeOutList): ICatalogAttributeHierarchy[] {
    const included = attributes.included ?? [];
    const outAttributeHierarchies = included.filter(
        (item) => item.type === "attributeHierarchy",
    ) as JsonApiAttributeHierarchyOutWithLinks[];
    return outAttributeHierarchies.map(convertAttributeHierarchy);
}

export async function loadAttributesAndDateDatasetsAndHierarchies(
    client: ITigerClient,
    workspaceId: string,
    rsqlFilter: string,
    loadAttributes?: boolean,
    loadDateDatasets?: boolean,
    loadAttributeHierarchies?: boolean,
    signal?: AbortSignal,
): Promise<CatalogItem[]> {
    const includeObjects: EntitiesApiGetAllEntitiesAttributesRequest["include"] = ["labels", "defaultView"];
    if (loadDateDatasets) {
        includeObjects.push("dataset");
    }
    if (loadAttributeHierarchies) {
        includeObjects.push("attributeHierarchies");
    }
    const params = addRsqlFilterToParams<EntitiesApiGetAllEntitiesAttributesRequest>(
        { workspaceId, include: includeObjects },
        rsqlFilter,
    );

    const attributes = await MetadataUtilities.getAllPagesOfParallel(
        client,
        client.entities.getAllEntitiesAttributes,
        params,
        {
            signal,
        },
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
    if (loadAttributeHierarchies) {
        const attributeHierarchies = createAttributeHierarchies(attributes);
        catalogItems.push(...attributeHierarchies);
    }

    return catalogItems;
}
