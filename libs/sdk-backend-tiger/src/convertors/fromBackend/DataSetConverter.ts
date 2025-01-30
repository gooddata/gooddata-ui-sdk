// (C) 2025 GoodData Corporation

import { IDataSetMetadataObject } from "@gooddata/sdk-model";
import { JsonApiDatasetOutWithLinks } from "@gooddata/api-client-tiger";
export function convertDataSetItem(dataSet: JsonApiDatasetOutWithLinks): IDataSetMetadataObject {
    return {
        id: dataSet.id,
        type: "dataSet",
        title: dataSet.attributes?.title ?? "",
        description: dataSet.attributes?.description ?? "",
        tags: dataSet.attributes?.tags,
        production: true,
        unlisted: false,
        deprecated: false,
        uri: dataSet.id,
        ref: {
            identifier: dataSet.id,
        },
    };
}
