// (C) 2025 GoodData Corporation

import { type JsonApiDatasetOutWithLinks } from "@gooddata/api-client-tiger";
import { type IDataSetMetadataObject } from "@gooddata/sdk-model";
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
