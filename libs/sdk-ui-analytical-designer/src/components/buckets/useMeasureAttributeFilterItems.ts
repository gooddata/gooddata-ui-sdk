// (C) 2019-2026 GoodData Corporation

import { useEffect, useRef, useState } from "react";

import { isEqual } from "lodash-es";

import {
    type IAttributeOrMeasure,
    type ICatalogAttribute,
    type ICatalogComputedAttribute,
    type IInsightDefinition,
    isCatalogComputedAttribute,
} from "@gooddata/sdk-model";

import { BackendToBearConvertors } from "../../convertors/index.js";
import { getMetricMDObject } from "../../services/metadata_service.js";
import { type IDecoratedBucketItem } from "../../typings/buckets.js";
import { type ITagsConfiguration } from "../../typings/route.js";
import { API } from "../../utils/organized_catalog_api.js";

import { type IMeasureAttributeFilterItem } from "./MeasureAttributeListItemOrganized.js";

export type MeasureAttributeFilterItemsLoader = (
    projectId: string,
    tagsConfiguration: ITagsConfiguration,
    options: {
        insight?: IInsightDefinition;
        items?: IAttributeOrMeasure[];
        enableComputedAttributes?: boolean;
    },
) => Promise<Array<ICatalogAttribute | ICatalogComputedAttribute>>;

export interface IUseMeasureAttributeFilterItemsParams {
    bucketItem: IDecoratedBucketItem;
    projectId: string;
    tagsConfiguration: ITagsConfiguration;
    itemsLoader?: MeasureAttributeFilterItemsLoader;
    isLocationIconEnabled?: boolean;
    computedAttributesEnabled?: boolean;
    /** false holds the load back (a closed dropdown); once loaded, the items stay */
    isEnabled?: boolean;
}

export interface IUseMeasureAttributeFilterItemsResult {
    items: IMeasureAttributeFilterItem[];
    isLoading: boolean;
}

const NO_ITEMS: IMeasureAttributeFilterItem[] = [];

/**
 * The value by content: the decorated bucket item (and the tags configuration) is rebuilt by its
 * selectors on inputs the loader does not read, so a reference change alone must not reload the
 * list — a reload drops the items and the search while the picker is open.
 */
function useContentStable<T>(value: T): T {
    const ref = useRef(value);
    if (ref.current !== value && !isEqual(ref.current, value)) {
        ref.current = value;
    }
    return ref.current;
}

export const toMeasureAttributeFilterItem = (
    item: ICatalogAttribute | ICatalogComputedAttribute,
    isLocationIconEnabled: boolean | undefined,
): IMeasureAttributeFilterItem => {
    // A computed attribute carries its metadata object under its own key and has no geo display
    // forms, but is otherwise picked the same way a regular attribute is.
    const isComputedAttribute = isCatalogComputedAttribute(item);
    const attribute = isComputedAttribute ? item.computedAttribute : item.attribute;
    const dataSet = isComputedAttribute
        ? item.computedAttribute.dataSet
        : (item.dataSet ?? item.attribute.dataSet);
    const isLocationIconVisible =
        !isComputedAttribute && item.geoPinDisplayForms.length > 0 && isLocationIconEnabled;
    const primaryDf = item.displayForms.find((df) => df.isPrimary);
    return {
        ref: attribute.ref,
        dfUri: item.defaultDisplayForm.uri,
        dfRef: item.defaultDisplayForm.ref,
        primaryUri: primaryDf?.uri,
        primaryRef: primaryDf?.ref,
        isLocationIconVisible,
        identifier: attribute.id,
        title: attribute.title,
        type: item.type,
        dataset: dataSet ? { identifier: dataSet.ref, title: dataSet.title } : undefined,
    };
};

/**
 * The attributes a metric can be filtered by, loaded for the metric on mount and again when the
 * metric or the catalog tags change.
 */
export function useMeasureAttributeFilterItems({
    bucketItem,
    projectId,
    tagsConfiguration,
    itemsLoader = API.loadAvailableMeasureAttributes,
    isLocationIconEnabled,
    computedAttributesEnabled = false,
    isEnabled = true,
}: IUseMeasureAttributeFilterItemsParams): IUseMeasureAttributeFilterItemsResult {
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<IMeasureAttributeFilterItem[]>(NO_ITEMS);
    const stableBucketItem = useContentStable(bucketItem);
    const stableTagsConfiguration = useContentStable(tagsConfiguration);

    useEffect(() => {
        // The mount and a tags/bucket-item change can each start a load, so two can be in flight
        // at once and settle out of order. Only the newest one may touch the state - otherwise a
        // slow failure wipes the items a later request already loaded (and a slow success
        // overwrites them); the cleanup of a run retires its request, as does the unmount. Same
        // reasoning as the in-flight guard in utils/api.ts.
        if (!isEnabled) {
            return undefined;
        }
        let isCurrentRequest = true;

        setIsLoading(true);
        setItems(NO_ITEMS);

        const mdObject = getMetricMDObject(stableBucketItem);
        const { items: bucketItems } = BackendToBearConvertors.convertBucket(mdObject.buckets[0]);

        void itemsLoader(projectId, stableTagsConfiguration, {
            items: bucketItems,
            enableComputedAttributes: computedAttributesEnabled,
        })
            .then((availableItems) => {
                if (isCurrentRequest) {
                    setItems(
                        availableItems.map((item) =>
                            toMeasureAttributeFilterItem(item, isLocationIconEnabled),
                        ),
                    );
                    setIsLoading(false);
                }
            })
            .catch((error: unknown) => {
                if (!isCurrentRequest) {
                    return;
                }
                // Without this the dropdown is stuck on its loading placeholder forever: the
                // search input and the item list only render once isLoading clears.
                console.error("Failed to load the metric attribute filter items", error);
                setItems(NO_ITEMS);
                setIsLoading(false);
            });

        return () => {
            isCurrentRequest = false;
        };
    }, [
        isEnabled,
        stableBucketItem,
        itemsLoader,
        projectId,
        stableTagsConfiguration,
        computedAttributesEnabled,
        isLocationIconEnabled,
    ]);

    return { items, isLoading };
}
