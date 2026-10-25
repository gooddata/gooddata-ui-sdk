// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import {
    type AccessGranularPermission,
    type CatalogItem,
    type ICatalogAttribute,
    type ICatalogGroup,
    type ObjRef,
    areObjRefsEqual,
    catalogItemMetadataObject,
    isCatalogAttribute,
    isCatalogComputedAttribute,
    isCatalogFact,
    isCatalogMeasure,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { enableHLL, enableUnavailableItemsVisibility } from "../../selectors/feature_flag_selector.js";
import { getLocale } from "../../selectors/intl_selector.js";
import { DateDatasetsService } from "../../services/date_datasets_service.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { getAvailableDateDatasets } from "../date_datasets/date_datasets_selectors.js";
import { type IAppState } from "../types.js";

import {
    catalogAttributeHierarchies,
    catalogDateHierarchies,
    catalogStateAvailableItemsUris,
    catalogStateFlags,
    catalogStateGroups,
    catalogStateItems,
    catalogStateParameters,
    catalogStateTooltipDetails,
} from "./catalog_reducer.js";
import { type ICatalogState } from "./catalog_types.js";

const getCatalogState = (state: IAppState): ICatalogState => state.data.catalog;

const getCatalogGroups = createSelector(getCatalogState, catalogStateGroups);

export const getSortedCatalogGroups = createSelector(
    getCatalogGroups,
    getLocale,
    (groups: ReadonlyArray<ICatalogGroup>, locale: string): ReadonlyArray<ICatalogGroup> => {
        const collator = new Intl.Collator(locale);
        return groups.slice().sort((group1, group2) => {
            return collator.compare(group1.title, group2.title);
        });
    },
);

export const getAvailableCatalogItemsUris = createSelector(getCatalogState, catalogStateAvailableItemsUris);

export const getCatalogItems = createSelector(getCatalogState, catalogStateItems);

export const getDateHierarchies = createSelector(getCatalogState, catalogDateHierarchies);

export const getAttributeHierarchies = createSelector(getCatalogState, catalogAttributeHierarchies);

export const getCatalogParameters = createSelector(getCatalogState, catalogStateParameters);

export const getCatalogItemById = (id: string) =>
    createSelector(getCatalogItems, (items) =>
        items.find((item) => {
            if (isCatalogAttribute(item)) {
                return item.attribute.id === id || item.defaultDisplayForm.id === id;
            }
            if (isCatalogFact(item)) {
                return item.fact.id === id;
            }
            if (isCatalogMeasure(item)) {
                return item.measure.id === id;
            }
            if (isCatalogComputedAttribute(item)) {
                return item.computedAttribute.id === id || item.defaultDisplayForm.id === id;
            }

            return false;
        }),
    );

export const getCatalogItemByRef = (ref: ObjRef) =>
    createSelector(getCatalogItems, (items) =>
        items.find((item) => {
            if (isCatalogAttribute(item)) {
                return (
                    areObjRefsEqual(item.attribute.ref, ref) ||
                    areObjRefsEqual(item.defaultDisplayForm.ref, ref)
                );
            }
            if (isCatalogFact(item)) {
                return areObjRefsEqual(item.fact.ref, ref);
            }
            if (isCatalogMeasure(item)) {
                return areObjRefsEqual(item.measure.ref, ref);
            }
            if (isCatalogComputedAttribute(item)) {
                return (
                    areObjRefsEqual(item.computedAttribute.ref, ref) ||
                    areObjRefsEqual(item.defaultDisplayForm.ref, ref)
                );
            }

            return false;
        }),
    );

export const getCatalogMeasures = createSelector(getCatalogItems, (items) => items.filter(isCatalogMeasure));

/** Metric permissions by identifier, so a catalog row does not scan the items. */
export const getMetricPermissionsByIdentifier = createSelector(getCatalogMeasures, (measures) => {
    const permissions = new Map<string, AccessGranularPermission[]>();
    measures.forEach(({ measure }) => {
        if (measure.permissions) {
            permissions.set(measure.id, measure.permissions);
        }
    });
    return permissions;
});

/**
 * Gets catalog items with HLL filtering applied.
 * When enableHLL is true, attributes without sourceColumn are hidden from the catalog.
 */
export const getHLLFilteredCatalogItems = createSelector(
    getCatalogItems,
    enableHLL,
    (items: ReadonlyArray<CatalogItem>, isHLLEnabled: boolean): ReadonlyArray<CatalogItem> => {
        if (!isHLLEnabled) {
            return items;
        }
        return items.filter((item: CatalogItem) => {
            if (isCatalogAttribute(item)) {
                return Boolean(item.attribute.sourceColumn);
            }
            return true;
        });
    },
);

/**
 * Gets items to show in the catalog. This selector works in two modes - with and without availability
 * filtering. The availability filtering happens when there is something already in the buckets. In that
 * case catalog must only contain items that make sense in the current context.
 */
export const getAvailableItems = createSelector(
    getAvailableCatalogItemsUris,
    getHLLFilteredCatalogItems,
    (
        availableItemsUris: ReadonlyArray<string>,
        items: ReadonlyArray<CatalogItem>,
    ): ReadonlyArray<CatalogItem> =>
        availableItemsUris
            ? items.filter((item: CatalogItem) =>
                  availableItemsUris.includes(catalogItemMetadataObject(item).uri),
              )
            : items,
);

export const getAvailableAttributes = createSelector(
    getAvailableItems,
    (availableItems): ReadonlyArray<ICatalogAttribute> => {
        return availableItems.filter(isCatalogAttribute);
    },
);

export const getAttributeHierarchiesWithCatalogItem = (catalogItemIdentifier: string) =>
    createSelector(getAttributeHierarchies, (attributeHierarchies) =>
        attributeHierarchies.filter((hierarchy) =>
            hierarchy.attributeHierarchy.attributes.some(
                (item) => isIdentifierRef(item) && item.identifier === catalogItemIdentifier,
            ),
        ),
    );

export const isDateItemAvailable = createSelector(
    getAvailableDateDatasets,
    DateDatasetsService.isDateDatasetsUpdating,
    // `.length`, not `.size`: `.size` on a plain array is undefined and `undefined > 0` would
    // silently hide the date item
    (availableDateDatasets: IDateDataset[], isDateDatasetsUpdating: boolean): boolean =>
        availableDateDatasets.length > 0 && !isDateDatasetsUpdating,
);

const getCatalogFlags = createSelector(getCatalogState, catalogStateFlags);

export const isLoadingGroups = createSelector(getCatalogFlags, (flags) => !!flags.loadingGroups);

export const isLoadingItems = (state: IAppState): boolean =>
    !DateDatasetsService.isDateDatasetsLoaded(state) || getCatalogFlags(state).loadingItems;

export const isLoadingAvailability = createSelector(getCatalogFlags, (flags) => !!flags.loadingAvailability);

export const hasAvailabilityError = createSelector(getCatalogFlags, (flags) => !!flags.availabilityError);

export const hasCatalogFirstLoaded = createSelector(getCatalogFlags, (flags) => flags.firstLoaded);

export const getAllTooltipDetails = createSelector(getCatalogState, catalogStateTooltipDetails);

export const hasAttributeHierarchiesChanged = createSelector(
    getCatalogFlags,
    (flags) => !!flags.attributeHierarchiesChanged,
);

export const getItemTooltipDetails = (state: IAppState, itemId: string) => {
    return getAllTooltipDetails(state)[itemId];
};

export const getUpdatedItemsCount = (state: IAppState) => {
    return getCatalogState(state).updatedItemsCount;
};

export const showUnavailableItems = (state: IAppState) => getCatalogState(state).showUnavailableItems;

export const shouldUnavailableItemsBeVisible = createSelector(
    showUnavailableItems,
    enableUnavailableItemsVisibility,
    (showUnavailableItems, enableUnavailableItemsVisibility) =>
        showUnavailableItems && enableUnavailableItemsVisibility,
);

export const isCatalogEmptyNoData = createSelector(
    isDateItemAvailable,
    getCatalogItems,
    getCatalogGroups,
    (showDateItem, catalogItems, catalogGroups) =>
        !showDateItem && catalogGroups.length === 0 && catalogItems.length === 0,
);

export const isWorkspaceEmpty = createSelector(
    getCatalogState,
    isDateItemAvailable,
    (catalogState, dateItemAvailable) => catalogState.isWorkspaceEmpty && !dateItemAvailable,
);
