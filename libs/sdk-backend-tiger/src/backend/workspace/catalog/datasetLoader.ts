// (C) 2019-2020 GoodData Corporation

import {
    AttributeResourceSchema,
    AttributeResourcesResponseSchema,
    DatasetResourceSchema,
    ITigerClient,
    LabelResourceReference,
    LabelResourceSchema,
    SuccessIncluded,
} from "@gooddata/api-client-tiger";
import { CatalogItem, ICatalogAttribute, ICatalogDateDataset } from "@gooddata/sdk-model";
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
    attribute: AttributeResourceSchema,
    included: SuccessIncluded[] | undefined,
): LabelResourceSchema[] {
    const labelsRefs = (attribute.relationships as any).labels.data as LabelResourceReference[];
    const allLabels: LabelResourceSchema[] = labelsRefs
        .map((ref) => {
            const obj = lookupRelatedObject(included, ref.id, ref.type);

            if (!obj) {
                return;
            }

            return obj as LabelResourceSchema;
        })
        .filter((obj): obj is LabelResourceSchema => obj !== undefined);

    return allLabels;
}

function isGeoLabel(label: LabelResourceSchema): boolean {
    /*
     * TODO: this is temporary way to identify labels with geo pushpin; normally this should be done
     *  using some indicator on the metadata object. for sakes of speed & after agreement with tiger team
     *  falling back to use of id convention.
     */
    return label.id.search(/^.*\.geo__/) > -1;
}

function createNonDateAttributes(attributes: AttributeResourcesResponseSchema): ICatalogAttribute[] {
    const nonDateAttributes = attributes.data.filter((attr) => attr.attributes.granularity === undefined);

    return nonDateAttributes.map((attribute) => {
        const allLabels = getAttributeLabels(attribute, attributes.included);
        const nonGeoLabels = allLabels.filter((label) => !isGeoLabel(label));
        const geoLabels = allLabels.filter(isGeoLabel);
        const defaultLabel = nonGeoLabels[0] ?? geoLabels[0];

        return convertAttribute(attribute, defaultLabel, geoLabels, allLabels);
    });
}

type DatasetWithAttributes = {
    dataset: DatasetResourceSchema;
    attributes: AttributeResourceSchema[];
};

function identifyDateDatasets(
    dateAttributes: AttributeResourceSchema[],
    included: SuccessIncluded[] | undefined,
) {
    const datasets: { [id: string]: DatasetWithAttributes } = {};

    dateAttributes.forEach((attribute) => {
        const ref = (attribute.relationships as any)?.dataset?.data;

        if (!ref) {
            return;
        }

        const dataset = lookupRelatedObject(included, ref.id, ref.type) as DatasetResourceSchema;

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

function createDateDatasets(attributes: AttributeResourcesResponseSchema): ICatalogDateDataset[] {
    const dateAttributes = attributes.data.filter((attr) => attr.attributes.granularity !== undefined);
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
    client: ITigerClient,
    includeTags: string[],
): Promise<CatalogItem[]> {
    const attributes = await client.metadata.attributesGet(
        {
            contentType: "application/json",
            include: "tags,labels,dataset",
        },
        {
            "filter[tags.id]": includeTags,
        },
    );

    const nonDateAttributes: CatalogItem[] = createNonDateAttributes(attributes.data);
    const dateDatasets: CatalogItem[] = createDateDatasets(attributes.data);

    return nonDateAttributes.concat(dateDatasets);
}
