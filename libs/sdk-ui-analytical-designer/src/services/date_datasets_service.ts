// (C) 2007-2026 GoodData Corporation

import { isEmpty, partial } from "lodash-es";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { type IDateDatasetsMeta } from "../models/date_datasets_meta.js";
import { type IDateDatasetsMetaItem } from "../models/date_datasets_meta_item.js";
import {
    getAvailableDateDatasets,
    getPlainDateDatasets,
    isDateDatasetsDropdownLoaded,
    isDateDatasetsLoaded,
    isDateDatasetsUpdating,
} from "../store/date_datasets/date_datasets_selectors.js";
import { type IAppState } from "../store/types.js";
import { type IDateDataset } from "../typings/datasets.js";
import { DateDatasetsMetaUtils } from "../utils/date_datasets_meta.js";

// The cross-domain READS of the date-datasets domain: they resolve against dateDatasetsMeta. The
// setters are slice case reducers in store/date_datasets.
import { DateDatasetsMetaService } from "./date_datasets_meta_service.js";

function fromMeta(metaDateDataset: IDateDatasetsMetaItem, isAvailable = false): IDateDataset {
    return {
        ref: metaDateDataset.ref,
        id: metaDateDataset.identifier,
        identifier: metaDateDataset.identifier,
        title: metaDateDataset.title,
        summary: metaDateDataset.summary,
        type: metaDateDataset.type,
        uri: metaDateDataset.uri,
        attributes: metaDateDataset.attributes,
        isAvailable,
        relevance: -1,
    };
}

function getDateDatasetByRef(state: IAppState, ref: ObjRef): IDateDataset {
    let found = getDateDatasetFromAvailablesByRef(state, ref);
    if (!found) {
        // handle unavailable datasets
        const foundInMeta = DateDatasetsMetaUtils.findDateDatasetMetaByRef(
            ref,
            DateDatasetsMetaService.getDateDatasetsMeta(state).items,
        );
        if (foundInMeta) {
            found = fromMeta(foundInMeta);
        }
    }
    return found;
}

function getDateDatasetByRefFromItems(
    items: IDateDataset[],
    ref: ObjRef,
    dateDatasetsMeta: IDateDatasetsMeta,
): IDateDataset {
    let found = getDateDatasetFromAvailableItemsByRef(items, ref);
    if (!found) {
        // handle unavailable datasets
        const foundInMeta = DateDatasetsMetaUtils.findDateDatasetMetaByRef(ref, dateDatasetsMeta.items);
        if (foundInMeta) {
            found = fromMeta(foundInMeta);
        }
    }
    return found;
}

function getDateDatasetsFromMetaInfo(
    dateDatasetsMeta: IDateDatasetsMeta,
    availables: IDateDataset[],
): IDateDataset[] {
    const dateDatasetMetas = dateDatasetsMeta?.items;
    if (isEmpty(dateDatasetMetas)) {
        // An empty ARRAY, not an empty object: the result is a list of date datasets and
        // consumers iterate it (#11767 — the empty sentinel's KIND is part of the contract).
        return [];
    }
    return dateDatasetMetas.map((item) => {
        const isAvailable = !!getDateDatasetFromAvailableItemsByRef(availables, item.ref);
        return fromMeta(item, isAvailable);
    });
}

const findByIdentifier = (identifier: string, dateDataset: IDateDataset) =>
    dateDataset.identifier === identifier;

function getDateDatasetByIdentifier(state: IAppState, identifier: string): IDateDataset {
    const predicate = partial(findByIdentifier, identifier);
    const availables = getAvailableDateDatasets(state);
    const result = availables.find(predicate);

    if (result) {
        return result;
    }

    const dateDatasetsMeta = DateDatasetsMetaService.getDateDatasetsMeta(state);
    return getDateDatasetsFromMetaInfo(dateDatasetsMeta, availables).find(predicate);
}

const findByUri = (uri: string, dateDataset: IDateDataset) => dateDataset.uri === uri;

function getDateDatasetByUri(state: IAppState, uri: string): IDateDataset {
    const predicate = partial(findByUri, uri);

    const availables = getAvailableDateDatasets(state);
    const result = availables.find(predicate);

    if (result) {
        return result;
    }

    const dateDatasetsMeta = DateDatasetsMetaService.getDateDatasetsMeta(state);
    return getDateDatasetsFromMetaInfo(dateDatasetsMeta, availables).find(predicate);
}

function getDateDatasetFromAvailablesByRef(state: IAppState, ref: ObjRef): IDateDataset {
    return getDateDatasetFromAvailableItemsByRef(getAvailableDateDatasets(state), ref);
}

function getDateDatasetFromAvailableItemsByRef(items: IDateDataset[], ref: ObjRef): IDateDataset {
    return items.find((dateDataset) => dateDataset.ref && areObjRefsEqual(dateDataset.ref, ref));
}

export const DateDatasetsService = {
    getAvailableDateDatasets,
    getPlainDateDatasets,
    getDateDatasetByRef,
    getDateDatasetByRefFromItems,
    getDateDatasetByIdentifier,
    getDateDatasetFromAvailablesByRef,
    getDateDatasetFromAvailableItemsByRef,
    getDateDatasetByUri,
    getDateDatasetsFromMetaInfo,
    // flag readers re-exported from the domain selectors so the ~10 call sites stay untouched
    isDateDatasetsLoaded,
    isDateDatasetsUpdating,
    isDateDatasetsDropdownLoaded,
};
