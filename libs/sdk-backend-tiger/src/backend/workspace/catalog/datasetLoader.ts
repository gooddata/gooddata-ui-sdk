// (C) 2019-2020 GoodData Corporation

import {
    Attributes,
    AttributesItem,
    DatasetsItem,
    ITigerClient,
    LabelsItem,
    RelationshipToOne,
    SuccessIncluded,
} from "@gooddata/api-client-tiger";
import { CatalogItem, ICatalogAttribute, ICatalogDateDataset } from "@gooddata/sdk-backend-spi";
import {
    convertAttribute,
    convertDateAttribute,
    convertDateDataset,
} from "../../../convertors/fromBackend/CatalogConverter";

function lookupRelatedObject(included: SuccessIncluded[] | undefined, id: string, type: string) {
    if (!included) {
        return;
    }

    return included?.find((item) => item.type === type && item.id === id);
}

function getAttributeLabels(
    attribute: AttributesItem,
    included: SuccessIncluded[] | undefined,
): LabelsItem[] {
    const labelsRefs = attribute.relationships?.labels?.data;
    let labelsArray: RelationshipToOne[] = [];
    if (Array.isArray(labelsRefs)) {
        labelsArray = (labelsRefs as unknown) as RelationshipToOne[];
    } else if (typeof labelsRefs === "object" && Object.keys(labelsRefs).length > 0) {
        labelsArray.push({ id: labelsRefs.id, type: labelsRefs.type });
    }
    const allLabels: LabelsItem[] = labelsArray
        .map((ref) => {
            const obj = lookupRelatedObject(included, ref.id, ref.type);
            if (!obj) {
                return;
            }
            return obj as LabelsItem;
        })
        .filter((obj): obj is LabelsItem => obj !== undefined);

    return allLabels;
}

function isGeoLabel(label: LabelsItem): boolean {
    /*
     * TODO: this is temporary way to identify labels with geo pushpin; normally this should be done
     *  using some indicator on the metadata object. for sakes of speed & after agreement with tiger team
     *  falling back to use of id convention.
     */
    return label.id.search(/^.*\.geo__/) > -1;
}

function createNonDateAttributes(attributes: Attributes): ICatalogAttribute[] {
    const nonDateAttributes = attributes.data.filter((attr) => attr.attributes?.granularity === undefined);

    return nonDateAttributes.map((attribute) => {
        const allLabels = getAttributeLabels(attribute, attributes.included);
        const nonGeoLabels = allLabels.filter((label) => !isGeoLabel(label));
        const geoLabels = allLabels.filter(isGeoLabel);
        const defaultLabel = nonGeoLabels[0] ?? geoLabels[0];

        return convertAttribute(attribute, defaultLabel, geoLabels, allLabels);
    });
}

type DatasetWithAttributes = {
    dataset: DatasetsItem;
    attributes: AttributesItem[];
};

function identifyDateDatasets(dateAttributes: AttributesItem[], included: SuccessIncluded[] | undefined) {
    const datasets: { [id: string]: DatasetWithAttributes } = {};

    dateAttributes.forEach((attribute) => {
        const ref = attribute.relationships?.dataset?.data;
        if (!ref) {
            return;
        }
        const dataset = lookupRelatedObject(included, ref.id, ref.type) as DatasetsItem;
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

    return Object.values(datasets);
}

function createDateDatasets(attributes: Attributes): ICatalogDateDataset[] {
    const dateAttributes = attributes.data.filter((attr) => attr.attributes?.granularity !== undefined);
    const dateDatasets = identifyDateDatasets(dateAttributes, attributes.included);

    return dateDatasets.map((dd) => {
        const catalogDateAttributes = dd.attributes.map((attribute) => {
            const labels = getAttributeLabels(attribute, attributes.included);
            const defaultLabel = labels[0];

            return convertDateAttribute(attribute, defaultLabel);
        });

        return convertDateDataset(dd.dataset, catalogDateAttributes);
    });
}

export async function loadAttributesAndDateDatasets(
    sdk: ITigerClient,
    workspaceId: string,
    includeTags: string[],
): Promise<CatalogItem[]> {
    const attributesResponse = await sdk.workspaceModel.getEntities(
        {
            entity: "attributes",
            workspaceId: workspaceId,
        },
        {
            headers: { Accept: "application/vnd.gooddata.api+json" },
            query: {
                include: "labels,datasets",
                // TODO - update after paging is fixed in MDC-354
                size: "500",
                tags: includeTags.join(","),
            },
        },
    );

    const attributes = attributesResponse.data as Attributes;
    const nonDateAttributes: CatalogItem[] = createNonDateAttributes(attributes);
    const dateDatasets: CatalogItem[] = createDateDatasets(attributes);

    return nonDateAttributes.concat(dateDatasets);
}
