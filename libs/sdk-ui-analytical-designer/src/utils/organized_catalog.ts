// (C) 2019-2026 GoodData Corporation

import { omitBy } from "lodash-es";

import {
    type AttributeDisplayFormType,
    type CatalogItem,
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogComputedAttribute,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogMeasure,
    type IMetadataObject,
} from "@gooddata/sdk-model";

import { type IOrganizedCatalogItem } from "../typings/catalog.js";
import { type ICacheItem, type ICacheItemDisplayForm } from "../typings/state_objects.js";

import { getPreferredAreaDisplayForm, getPreferredLocationDisplayForm } from "./displayForms.js";

function getUnavailableItemsCount(
    searchQuery: string,
    availableItems: ReadonlyArray<IOrganizedCatalogItem>,
    allItems: ReadonlyArray<IOrganizedCatalogItem>,
    availableSearchMatchingItems: ReadonlyArray<IOrganizedCatalogItem>,
    allSearchMatchingItems: ReadonlyArray<IOrganizedCatalogItem>,
): number {
    return searchQuery === ""
        ? allItems.length - availableItems.length
        : allSearchMatchingItems.length - availableSearchMatchingItems.length;
}

const convertCatalogItemBase = (metadataObject: IMetadataObject) => ({
    ref: metadataObject.ref,
    identifier: metadataObject.id,
    title: metadataObject.title,
    uri: metadataObject.uri,
    summary: metadataObject.description,
});

const asCacheDisplayForm = (df: IAttributeDisplayFormMetadataObject): ICacheItemDisplayForm => ({
    id: df.id,
    uri: df.uri,
    ref: df.ref,
    type: df.displayFormType as AttributeDisplayFormType,
    title: df.title,
    isDefault: df.isDefault,
    isPrimary: df.isPrimary,
});

const convertAttribute = (catalogAttribute: ICatalogAttribute): ICacheItem => {
    const locationDisplayForm = getPreferredLocationDisplayForm(catalogAttribute.geoPinDisplayForms);
    const areaDisplayForm = getPreferredAreaDisplayForm(catalogAttribute.geoPinDisplayForms);
    return {
        ...convertCatalogItemBase(catalogAttribute.attribute),
        type: "attribute",
        dfRef: catalogAttribute.defaultDisplayForm?.ref,
        dfUri: catalogAttribute.defaultDisplayForm?.uri,
        dfUris: catalogAttribute.displayForms?.map((df) => df.uri),
        dfIdentifier: catalogAttribute.defaultDisplayForm?.id,
        dfIdentifiers: catalogAttribute.displayForms?.map((df) => df.id),
        displayForms: catalogAttribute.displayForms?.map((df) => asCacheDisplayForm(df)),
        locationDisplayFormRef: locationDisplayForm?.ref,
        locationDisplayFormUri: locationDisplayForm?.uri,
        locationDisplayFormIdentifier: locationDisplayForm?.id,
        areaDisplayFormRef: areaDisplayForm?.ref,
        areaDisplayFormUri: areaDisplayForm?.uri,
        areaDisplayFormIdentifier: areaDisplayForm?.id,
    };
};

const convertComputedAttribute = (catalogComputedAttribute: ICatalogComputedAttribute): ICacheItem => ({
    ...convertCatalogItemBase(catalogComputedAttribute.computedAttribute),
    type: "computedAttribute",
    expression: catalogComputedAttribute.computedAttribute.expression,
    dfRef: catalogComputedAttribute.defaultDisplayForm?.ref,
    dfUri: catalogComputedAttribute.defaultDisplayForm?.uri,
    dfUris: catalogComputedAttribute.displayForms?.map((df) => df.uri),
    dfIdentifier: catalogComputedAttribute.defaultDisplayForm?.id,
    dfIdentifiers: catalogComputedAttribute.displayForms?.map((df) => df.id),
    displayForms: catalogComputedAttribute.displayForms?.map((df) => asCacheDisplayForm(df)),
});

const convertMeasure = (catalogMeasure: ICatalogMeasure): ICacheItem => ({
    ...convertCatalogItemBase(catalogMeasure.measure),
    type: "metric",
    expression: catalogMeasure.measure.expression,
    format: catalogMeasure.measure.format,
});

const convertFact = (catalogFact: ICatalogFact): ICacheItem => ({
    ...convertCatalogItemBase(catalogFact.fact),
    type: "fact",
});

const convertDateDataset = (catalogDateDataset: ICatalogDateDataset): ICacheItem => ({
    ...convertCatalogItemBase(catalogDateDataset.dataSet),
    type: "date",
});

const convertAttributeHierarchy = (catalogAttributeHierarchy: ICatalogAttributeHierarchy): ICacheItem => ({
    ...convertCatalogItemBase(catalogAttributeHierarchy.attributeHierarchy),
    type: "attributeHierarchy",
});

const convertCatalogItem = (catalogItem: CatalogItem): ICacheItem => {
    if (catalogItem.type === "attribute") {
        return convertAttribute(catalogItem);
    } else if (catalogItem.type === "measure") {
        return convertMeasure(catalogItem);
    } else if (catalogItem.type === "fact") {
        return convertFact(catalogItem);
    } else if (catalogItem.type === "attributeHierarchy") {
        return convertAttributeHierarchy(catalogItem);
    } else if (catalogItem.type === "computedAttribute") {
        return convertComputedAttribute(catalogItem);
    } else {
        return convertDateDataset(catalogItem);
    }
};

function convertItemCacheObject(catalogItem: CatalogItem): ICacheItem {
    const oldItem = convertCatalogItem(catalogItem);
    return omitBy(oldItem, (i) => !i) as ICacheItem;
}

function convertToItemCacheList(catalogItems: ReadonlyArray<CatalogItem>): ReadonlyArray<ICacheItem> {
    return catalogItems.map(convertItemCacheObject);
}

function convertToItemCacheMap(catalogItems: ReadonlyArray<CatalogItem>): Record<string, ICacheItem> {
    const accumulator: Record<string, ICacheItem> = {};
    return catalogItems.reduce((cacheItems, item) => {
        const { identifier, type } = convertCatalogItem(item);
        cacheItems[`${type}.${identifier}`] = convertItemCacheObject(item);
        return cacheItems;
    }, accumulator);
}

export const OrganizedCatalogUtils = {
    convertToItemCacheMap,
    convertToItemCacheList,
    getUnavailableItemsCount,
};
