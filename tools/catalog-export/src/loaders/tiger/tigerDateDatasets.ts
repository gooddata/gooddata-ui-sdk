// (C) 2007-2021 GoodData Corporation

import { Attribute, DateDataSet } from "../../base/types";
import {
    JsonApiAttributeList,
    JsonApiAttribute,
    JsonApiDataset,
    ITigerClient,
} from "@gooddata/api-client-tiger";
import {
    convertAttribute,
    createDatasetMap,
    createLabelMap,
    DatasetMap,
    getReferencedDataset,
    LabelMap,
} from "./tigerCommon";

type DatasetWithAttributes = {
    dataset: JsonApiDataset;
    attributes: JsonApiAttribute[];
};

function findDateDatasetsWithAttributes(
    attributes: JsonApiAttributeList,
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
    _projectId: string,
    tigerClient: ITigerClient,
): Promise<DateDataSet[]> {
    const result = await tigerClient.workspaceModel.getEntitiesAttributes(
        {
            workspaceId: _projectId,
        },
        {
            headers: { Accept: "application/vnd.gooddata.api+json" },
            query: {
                include: "labels,datasets",
                // TODO - update after paging is fixed in MDC-354
                size: "500",
            },
        },
    );

    const labelsMap = createLabelMap(result.data.included);
    const datasetsMap = createDatasetMap(result.data.included);

    const dateDatasets = findDateDatasetsWithAttributes(result.data, datasetsMap);

    return convertToExportableFormat(dateDatasets, labelsMap);
}
