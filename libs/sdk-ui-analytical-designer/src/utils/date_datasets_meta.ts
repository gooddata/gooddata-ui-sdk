// (C) 2007-2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { _isEmpty } from "@gooddata/util";

import { type IDateDatasetsMeta } from "../models/date_datasets_meta.js";
import type { IDateDatasetsMetaItem } from "../models/date_datasets_meta_item.js";
import { type IDateDatasets } from "../typings/datasets.js";

export const DateDatasetsMetaUtils = {
    collectMeta,
    findDateDatasetMetaByUri,
    findDateDatasetMetaByRef,
};

function collectMeta(dateDatasets: IDateDatasets): IDateDatasetsMeta {
    if (_isEmpty(dateDatasets)) {
        return null;
    }

    return {
        items: dateDatasets.available.map((dateDataset) => {
            return {
                ref: dateDataset.ref,
                identifier: dateDataset.identifier,
                uri: dateDataset.uri,
                type: dateDataset.type,
                title: dateDataset.title,
                summary: dateDataset.summary,
                attributes: dateDataset.attributes,
            };
        }),
    };
}

function findDateDatasetMetaByUri(
    uri: string,
    dateDatasetMetas: IDateDatasetsMetaItem[],
): IDateDatasetsMetaItem {
    if (_isEmpty(dateDatasetMetas)) {
        return undefined;
    }
    return dateDatasetMetas.find((dateDatasetMeta) => dateDatasetMeta.uri === uri);
}

function findDateDatasetMetaByRef(
    ref: ObjRef,
    dateDatasetMetas: IDateDatasetsMetaItem[],
): IDateDatasetsMetaItem {
    if (_isEmpty(dateDatasetMetas)) {
        return undefined;
    }
    return dateDatasetMetas.find((dateDatasetMeta) => areObjRefsEqual(dateDatasetMeta.ref, ref));
}
