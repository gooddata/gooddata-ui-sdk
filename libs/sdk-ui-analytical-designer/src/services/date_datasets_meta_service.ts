// (C) 2007-2026 GoodData Corporation

import {
    getDateAttributes,
    getDateDatasetUriByIdentifier,
    getDateDatasetsMeta,
    getDateDatasetsMetaItems,
} from "../store/date_datasets_meta/date_datasets_meta_selectors.js";

/**
 * Facade over the store/date_datasets_meta domain, for the `DateDatasetsMetaService.*` call sites.
 * The write is a slice case reducer (SET_DATE_DATASETS_META), the itemCache side effect belongs to
 * the itemCache slice, and the readers are selectors hanging off the domain's own input selector.
 */
export const DateDatasetsMetaService = {
    getDateDatasetsMeta,
    getDateDatasetsMetaItems,
    getDateDatasetUriByIdentifier,
    getDateAttributes,
};
