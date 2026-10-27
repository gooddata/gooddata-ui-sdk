// (C) 2019-2026 GoodData Corporation

import {
    type CatalogItemType,
    type IAttributeOrMeasure,
    type ICatalogAttribute,
    type ICatalogComputedAttribute,
    type IInsightDefinition,
    isCatalogComputedAttribute,
} from "@gooddata/sdk-model";

import { backend } from "../backend.js";
import { type ITagsConfiguration } from "../typings/route.js";

import { mergeSortedAlphabeticallyByTitle } from "./merge_sorted_by_title.js";

/**
 * The attributes a single metric can be filtered by. Computed attributes are filterable just like
 * regular ones, so when they are enabled they are loaded alongside and returned in one list for the
 * picker to render.
 */
async function loadAvailableMeasureAttributes(
    projectId: string,
    tagsConfiguration: ITagsConfiguration,
    options: {
        insight?: IInsightDefinition;
        items?: IAttributeOrMeasure[];
        enableComputedAttributes?: boolean;
    },
): Promise<Array<ICatalogAttribute | ICatalogComputedAttribute>> {
    // Asking for the computed attribute type changes both the catalog request and the
    // computeValidObjects body, so it stays behind the feature flag - same as the main catalog load.
    // Temporary, together with the flag itself: ask for both types unconditionally once it is gone.
    const types: CatalogItemType[] = options.enableComputedAttributes
        ? ["attribute", "computedAttribute"]
        : ["attribute"];
    let catalogLoader = backend.workspace(projectId).catalog().forTypes(types);

    if (tagsConfiguration.excludeObjectsWithTags) {
        catalogLoader = catalogLoader.excludeTags(tagsConfiguration.excludeObjectsWithTags);
    }
    if (tagsConfiguration.includeObjectsWithTags) {
        catalogLoader = catalogLoader.includeTags(tagsConfiguration.includeObjectsWithTags);
    }

    const catalog = await catalogLoader.load();

    let availableItemsLoader = catalog.availableItems();
    if (options.insight) {
        availableItemsLoader = availableItemsLoader.forInsight(options.insight);
    }
    if (options.items) {
        availableItemsLoader = availableItemsLoader.forItems(options.items);
    }

    const availableItems = await availableItemsLoader.load();
    return options.enableComputedAttributes
        ? mergeAvailableMeasureAttributes(
              availableItems.availableAttributes(),
              availableItems.availableComputedAttributes(),
          )
        : availableItems.availableAttributes();
}

/**
 * The two catalog types come back as separate, independently sorted lists; merging them re-sorted
 * files a computed attribute in alphabetically among the regular attributes instead of after them.
 */
export function mergeAvailableMeasureAttributes(
    attributes: ReadonlyArray<ICatalogAttribute>,
    computedAttributes: ReadonlyArray<ICatalogComputedAttribute>,
): Array<ICatalogAttribute | ICatalogComputedAttribute> {
    return mergeSortedAlphabeticallyByTitle<ICatalogAttribute | ICatalogComputedAttribute>(
        attributes,
        computedAttributes,
        (item) => (isCatalogComputedAttribute(item) ? item.computedAttribute.title : item.attribute.title),
    );
}

export const API = {
    loadAvailableMeasureAttributes,
};
