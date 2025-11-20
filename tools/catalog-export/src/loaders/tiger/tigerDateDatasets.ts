// (C) 2007-2025 GoodData Corporation

import {
    ITigerClientBase,
    JsonApiAttributeOutList,
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetOut,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { EntitiesApi_GetAllEntitiesAttributes } from "@gooddata/api-client-tiger/entitiesObjects";

import {
    DatasetMap,
    LabelMap,
    convertAttribute,
    createDatasetMap,
    createLabelMap,
    getReferencedDataset,
} from "./tigerCommon.js";
import { Attribute, DateDataSet } from "../../base/types.js";

type DatasetWithAttributes = {
    dataset: JsonApiDatasetOut;
    attributes: JsonApiAttributeOutWithLinks[];
};

function findDateDatasetsWithAttributes(
    attributes: JsonApiAttributeOutList,
    datasetsMap: DatasetMap,
): DatasetWithAttributes[] {
    const res: { [id: string]: DatasetWithAttributes } = {};

    const dateAttributes = attributes.data.filter(
        (attribute) => attribute.attributes?.granularity !== undefined,
    );

    dateAttributes.forEach((attribute) => {
        const dataset = getReferencedDataset(attribute.relationships, datasetsMap);
        if (!dataset) {
            return;
        }

        const entry = res[dataset.id];

        if (entry) {
            entry.attributes.push(attribute);
        } else {
            res[dataset.id] = {
                dataset,
                attributes: [attribute],
            };
        }
    });

    return Object.values(res);
}

function convertToExportableFormat(
    dateDatasets: DatasetWithAttributes[],
    labelsMap: LabelMap,
): DateDataSet[] {
    return dateDatasets.map(({ dataset, attributes }) => {
        return {
            dateDataSet: {
                meta: {
                    title: dataset.attributes?.title ?? dataset.id,
                    identifier: dataset.id,
                    tags: dataset.attributes?.tags?.join(",") ?? "",
                },
                content: {
                    attributes: attributes
                        .map((attribute) => convertAttribute(attribute, labelsMap))
                        .filter((a): a is Attribute => a !== undefined),
                },
            },
        };
    });
}

export async function loadDateDataSets(
    client: ITigerClientBase,
    workspaceId: string,
): Promise<DateDataSet[]> {
    const result = await MetadataUtilities.getAllPagesOfParallel(
        client,
        EntitiesApi_GetAllEntitiesAttributes,
        {
            workspaceId,
            include: ["labels", "datasets"],
        },
    ).then(MetadataUtilities.mergeEntitiesResults);
    const labelsMap = createLabelMap(result.included);
    const datasetsMap = createDatasetMap(result.included);

    const dateDatasets = findDateDatasetsWithAttributes(result, datasetsMap);

    return convertToExportableFormat(dateDatasets, labelsMap);
}
