// (C) 2007-2022 GoodData Corporation

import { Attribute, DateDataSet } from "../../base/types.js";
import {
    JsonApiAttributeOutList,
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetOut,
    ITigerClient,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import {
    convertAttribute,
    createDatasetMap,
    createLabelMap,
    DatasetMap,
    getReferencedDataset,
    LabelMap,
} from "./tigerCommon.js";
import values from "lodash/values.js";

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

        if (!entry) {
            res[dataset.id] = {
                dataset,
                attributes: [attribute],
            };
        } else {
            entry.attributes.push(attribute);
        }
    });

    return values(res);
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

export async function loadDateDataSets(client: ITigerClient, workspaceId: string): Promise<DateDataSet[]> {
    const result = await MetadataUtilities.getAllPagesOf(client, client.entities.getAllEntitiesAttributes, {
        workspaceId,
        include: ["labels", "datasets"],
    }).then(MetadataUtilities.mergeEntitiesResults);
    const labelsMap = createLabelMap(result.included);
    const datasetsMap = createDatasetMap(result.included);

    const dateDatasets = findDateDatasetsWithAttributes(result, datasetsMap);

    return convertToExportableFormat(dateDatasets, labelsMap);
}
