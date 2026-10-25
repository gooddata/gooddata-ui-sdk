// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getFormatLocale } from "./bootstrap_selector.js";
import { bucketItemHeaderSelector } from "./bucket_item_header_selector.js";
import { getMeasureSequenceNumbers } from "./measure_sequence_numbers_selector.js";

export const getFormatLocaleObject = createSelector(getFormatLocale, (formatLocale) =>
    formatLocale ? { formatLocale } : {},
);

export const selectMeasureBucketItemHeader = createSelector(
    bucketItemHeaderSelector,
    getMeasureSequenceNumbers,
    getFormatLocaleObject,
    (bucketItemHeaderProperties, measureSequenceNumbers, formatLocaleObj) => {
        return {
            ...bucketItemHeaderProperties,
            measureSequenceNumbers,
            ...formatLocaleObj,
        };
    },
);
