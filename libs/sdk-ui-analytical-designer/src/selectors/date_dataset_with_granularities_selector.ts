// (C) 2021-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IDateDatasetsMetaItem } from "../models/date_datasets_meta_item.js";
import { GRANULARITY_OPTIONS } from "../models/granularity.js";
import { DateDatasetsMetaService } from "../services/date_datasets_meta_service.js";
import {
    type IDateDatasetRefWithGranularities,
    type IGranularityOptionWithRefs,
} from "../typings/datasets.js";

import { getItemCache } from "./item_cache_selector.js";

export const getDateDatasetRefsWithGranularities = createSelector(
    DateDatasetsMetaService.getDateDatasetsMetaItems,
    getItemCache,
    (dateDatasetsMetaItems, itemCache): IDateDatasetRefWithGranularities[] =>
        dateDatasetsMetaItems.map((dateDatasetMetaItem: IDateDatasetsMetaItem) => {
            const attributes = GRANULARITY_OPTIONS.reduce(
                (attributes: IGranularityOptionWithRefs[], option) => {
                    const attribute = dateDatasetMetaItem.attributes.find(
                        ({ dateType }) => dateType === option.dateType,
                    );

                    if (attribute) {
                        const cacheItem = itemCache[attribute.granularity];

                        attributes.push({
                            ref: attribute.ref,
                            dfRef: attribute.dfRef,
                            cacheIdentifier: cacheItem?.identifier,
                            ...option,
                        });
                    }

                    return attributes;
                },
                [],
            );

            return {
                ref: dateDatasetMetaItem.ref,
                attributes,
            };
        }),
);
