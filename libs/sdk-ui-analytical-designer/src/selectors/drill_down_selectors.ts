// (C) 2023-2026 GoodData Corporation

import { createSelector } from "reselect";

import {
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    type ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { getAttribute } from "../models/decorated_bucket_item.js";
import { getAttributes } from "../services/buckets_service.js";
import { getAttributeHierarchies, getDateHierarchies } from "../store/catalog/catalog_selector.js";
import { getPlainDateDatasets } from "../store/date_datasets/date_datasets_selectors.js";
import { type IRawBucketItem, type IRawBucketItems } from "../typings/buckets.js";
import { type IDateDatasetAttribute } from "../typings/dataset_attribute.js";
import { type IDateDataset, type IDateDatasets } from "../typings/datasets.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

import { getItemCache } from "./item_cache_selector.js";

export interface IDrillDown {
    bucketItem: {
        localIdentifier: string;
        type: "attribute" | "date";
        title: string;
    };
    attributeHierarchies: (ICatalogAttributeHierarchy | ICatalogDateAttributeHierarchy)[];
}

/** The decorated attribute `getAttribute` returns — an itemCache entry with a title. */
interface ITitledCacheEntry extends ICatalogEntry {
    title: string;
    /** a DATE entry's granularity rider */
    granularity?: string;
}

interface IAttribute {
    ref: ObjRef;
    localIdentifier: string;
    title?: string;
    alias?: string;
    type: "date" | "attribute";
}

const sanitizeAttribute = (
    attribute: IRawBucketItem,
    decoratedAttribute: ITitledCacheEntry,
    dateDatasets: IDateDatasets,
): IAttribute => {
    if (attribute.type === "date") {
        // object with almost no information is returned, we need to find all the necessary info from dataset
        const dateDataset = dateDatasets.allItems?.find((dateDataset: IDateDataset) =>
            areObjRefsEqual(dateDataset.ref, attribute.dateDatasetRef),
        );
        const dateAttribute =
            dateDataset?.attributes?.find(
                (item: IDateDatasetAttribute) => item.dateType === decoratedAttribute.granularity,
            ) ?? {};
        return dateAttribute
            ? ({
                  ...dateAttribute,
                  localIdentifier: attribute.localIdentifier,
                  type: "date",
              } as IAttribute)
            : undefined;
    }
    // title is not set in the bucket item for some reason, we need to find it in decorated one
    return {
        ...attribute,
        title: decoratedAttribute.title,
        type: "attribute",
    } as IAttribute;
};

const getUniqueAttributes = (attribute: IAttribute, index: number, self: IAttribute[]) =>
    self.map((item) => item.ref).findIndex((ref) => areObjRefsEqual(ref, attribute.ref)) === index;

const containsAttribute = (searchedAttribute: ObjRef, attributes: ObjRef[]) =>
    attributes.some((attribute) => areObjRefsEqual(attribute, searchedAttribute));

export const getDrillDowns = createSelector(
    getAttributeHierarchies,
    getDateHierarchies,
    getAttributes,
    getItemCache,
    getPlainDateDatasets,
    (
        attributeHierarchies: readonly ICatalogAttributeHierarchy[],
        dateHierarchies: readonly ICatalogDateAttributeHierarchy[],
        attributes: IRawBucketItems,
        itemCache,
        dateDatasets,
    ) => {
        return (
            [...(attributes ?? [])].map((bucketAttribute) =>
                sanitizeAttribute(
                    bucketAttribute,
                    getAttribute(bucketAttribute, itemCache) as ITitledCacheEntry,
                    dateDatasets,
                ),
            ) as IAttribute[]
        )
            .filter(getUniqueAttributes)
            .map((attribute: IAttribute) => {
                const matchingAttributeHierarchies = attributeHierarchies.filter(({ attributeHierarchy }) =>
                    containsAttribute(attribute.ref, attributeHierarchy.attributes),
                );
                const matchingDateHierarchies = dateHierarchies.filter(({ attributes }) =>
                    containsAttribute(attribute.ref, attributes),
                );
                return attribute
                    ? {
                          bucketItem: {
                              localIdentifier: attribute.localIdentifier,
                              type: attribute.type === "date" ? "date" : "attribute",
                              title: attribute.alias ?? attribute.title,
                          },
                          attributeHierarchies: [...matchingAttributeHierarchies, ...matchingDateHierarchies],
                      }
                    : undefined;
            })
            .filter(
                (drillDown): drillDown is IDrillDown =>
                    !!drillDown && drillDown.attributeHierarchies.length > 0,
            );
    },
);
