// (C) 2007-2020 GoodData Corporation

import { Attribute, DateDataSet } from "../../base/types";
import { AttributeResourceSchema, DatasetResourceSchema, ITigerClient } from "@gooddata/gd-tiger-client";
import { DefaultGetOptions } from "./tigerClient";
import {
    convertAttribute,
    convertTags,
    createDatasetMap,
    createLabelMap,
    createTagMap,
    DatasetMap,
    getReferencedDataset,
    LabelMap,
    TagMap,
} from "./tigerCommon";

type DatasetWithAttributes = {
    dataset: DatasetResourceSchema;
    attributes: AttributeResourceSchema[];
};

function findDateDatasetsWithAttributes(
    attributes: AttributeResourceSchema[],
    datasetsMap: DatasetMap,
): DatasetWithAttributes[] {
    const res: { [id: string]: DatasetWithAttributes } = {};

    /*
     * TODO: this can be replaced with server-side filtering, need to figure out the query
     */
    const dateAttributes = attributes.filter(entity => entity.attributes.granularity !== undefined);

    dateAttributes.forEach(attribute => {
        const dataset = getReferencedDataset(attribute.relationships, datasetsMap);
        if (!dataset) {
            return;
        }

        const entry = res[dataset.id];

        if (!entry) {
            res[dataset.id] = {
                dataset,
                attributes: [attribute],
            };
        } else {
            entry.attributes.push(attribute);
        }
    });

    return Object.values(res);
}

function convertToExportableFormat(
    dateDatasets: DatasetWithAttributes[],
    labelsMap: LabelMap,
    tagsMap: TagMap,
): DateDataSet[] {
    return dateDatasets.map(({ dataset, attributes }) => {
        return {
            dateDataSet: {
                meta: {
                    title: dataset.attributes.title ?? dataset.id,
                    identifier: dataset.id,
                    tags: convertTags(dataset.relationships, tagsMap),
                },
                content: {
                    attributes: attributes
                        .map(attribute => convertAttribute(attribute, labelsMap, tagsMap))
                        .filter((a): a is Attribute => a !== undefined),
                },
            },
        };
    });
}

export async function loadDateDataSets(
    _projectId: string,
    tigerClient: ITigerClient,
): Promise<DateDataSet[]> {
    const result = await tigerClient.metadata.attributesGet({
        ...DefaultGetOptions,
        include: "labels,tags,dataset",
    });

    const tagsMap = createTagMap(result.data.included);
    const labelsMap = createLabelMap(result.data.included);
    const datasetsMap = createDatasetMap(result.data.included);

    const dateDatasets = findDateDatasetsWithAttributes(result.data.data, datasetsMap);

    return convertToExportableFormat(dateDatasets, labelsMap, tagsMap);
}
