// (C) 2007-2026 GoodData Corporation

import { constant, times } from "lodash-es";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    ATTRIBUTE,
    CATALOG,
    COMPUTED_ATTRIBUTE,
    DATE,
    FACT,
    FILTERS,
    GEO_ATTRIBUTE,
    LOCATION,
    MEASURES,
    METRIC,
    STACK,
    VIEW,
} from "../constants/bucket.js";
import { ATTRIBUTES } from "../constants/catalog_filters.js";
import { BUCKET_ITEM, CATALOG_LIST_ITEM } from "../constants/drag_item_types.js";
import { createDecoratedBucketsMock } from "../tests/decorated_bucket.test.helpers.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IDecoratedBuckets,
    type IRawBucketItem,
    type IRawBuckets,
} from "../typings/buckets.js";
import { type IBucketItemDropContext, type ICatalogItemDropContext } from "../typings/drag_and_drop.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

import {
    type ItemType,
    isAccepted,
    isAllowedToAdd,
    isAllowedToReorder,
    isAllowedToReplace,
    isWithinLimit,
} from "./bucket_rules.js";
import { DATE_DATASET_ATTRIBUTE, createDateItem } from "./date_item.js";
import { newDecoratedBucket } from "./decorated_bucket.js";
import { newDecoratedBucketItem } from "./decorated_bucket_item.js";

describe("Bucket Rules", () => {
    let decoratedBuckets: IDecoratedBuckets;
    let decoratedFilterBucket: IDecoratedBucket;

    beforeEach(() => {
        const buckets: IRawBuckets = [
            {
                localIdentifier: MEASURES,
                items: [],
            },
            {
                localIdentifier: VIEW,
                items: [],
            },
            {
                localIdentifier: STACK,
                items: [],
            },
            {
                localIdentifier: LOCATION,
                items: [],
            },
        ];

        const uiSettings = {
            measures: {
                accepts: [METRIC, FACT, ATTRIBUTE],
                enabled: true,
                allowsReordering: true,
                allowsDuplicateItems: true,
                allowsSwapping: false,
                itemsLimit: 20,
                isShowInPercentEnabled: false,
            },
            view: {
                accepts: [ATTRIBUTE, DATE],
                itemsLimit: 1,
                allowsSwapping: true,
                allowsReordering: false,
                enabled: true,
                isShowInPercentEnabled: false,
            },
            stack: {
                accepts: [ATTRIBUTE],
                itemsLimit: 1,
                allowsSwapping: true,
                allowsReordering: false,
                enabled: true,
                isShowInPercentEnabled: false,
            },
            location: {
                accepts: [ATTRIBUTE],
                itemsLimit: 1,
                allowsSwapping: true,
                allowsReordering: false,
                enabled: true,
                isShowInPercentEnabled: false,
            },
            filters: {
                accepts: [ATTRIBUTE, DATE],
                itemsLimit: 20,
                itemsLimitByType: {
                    date: 1,
                },
                allowsReordering: false,
                enabled: true,
                isShowInPercentEnabled: false,
            },
        };

        decoratedBuckets = createDecoratedBucketsMock(buckets, uiSettings);

        decoratedFilterBucket = newDecoratedBucket({
            localIdentifier: FILTERS,
            items: [],
            itemsLimit: 20,
            itemsLimitByType: {
                date: 1,
            },
            enabled: true,
            canAddItems: true,
            accepts: [ATTRIBUTE, DATE],
        });
    });

    const dummyDestBucketItem: IRawBucketItem = {};
    const dummyDecoratedBucketItem: IDecoratedBucketItem = newDecoratedBucketItem();

    function updateBucket(
        buckets: IDecoratedBuckets,
        index: number,
        changes: Partial<IDecoratedBucket>,
    ): IDecoratedBuckets {
        return buckets.map((bucket, i) => (i === index ? { ...bucket, ...changes } : bucket));
    }

    const buildAreaCatalogItem = () => ({
        identifier: "area_attribute",
        type: ATTRIBUTE,
        isLocationIconVisible: true,
        areaDisplayFormRef: {
            uri: "/geo/attribute/displayform/uri/area",
        },
        geoPinDisplayForms: [
            {
                displayFormType: "GDC.geo.area",
            },
        ],
    });

    const buildLocationCatalogItem = () => ({
        identifier: "location_attribute",
        type: ATTRIBUTE,
        isLocationIconVisible: true,
        locationDisplayFormRef: {
            uri: "/geo/attribute/displayform/uri/location",
        },
        geoPinDisplayForms: [
            {
                displayFormType: "GDC.geo.pin",
            },
        ],
    });

    function buildCatalogItemDropContext(
        item: ICatalogEntry,
        bucket: IDecoratedBucket,
        to: string,
        destBucketItem?: IRawBucketItem,
    ): ICatalogItemDropContext {
        return {
            bucket,
            item,
            type: CATALOG_LIST_ITEM,
            to,
            from: CATALOG,
            dragged: item.type,
            renderDraggedItemElement: vi.fn(),
            destBucketItem,
        };
    }

    function buildBucketItemDropContext(
        bucketItem: IRawBucketItem,
        catalogItem: ICatalogEntry,
        bucket: IDecoratedBucket,
        from: string,
        to: string,
        destBucketItem?: IRawBucketItem,
    ): IBucketItemDropContext {
        return {
            bucket,
            bucketItem,
            item: catalogItem,
            type: BUCKET_ITEM,
            to,
            from,
            index: 0,
            dragged: catalogItem?.type,
            renderDraggedItemElement: vi.fn(),
            destBucketItem,
        };
    }

    function buildBucketItem(type: ItemType): IRawBucketItem {
        return {
            type,
        };
    }

    describe("isWithinLimit", () => {
        const catalogItem: ICatalogEntry = {
            identifier: "item_identifier",
            type: ATTRIBUTE,
        };

        const dateItem: ICatalogEntry = {
            identifier: "item_identifier",
            type: DATE,
        };

        it("should return false when bucket contains only master items and itemsLimit is 2", () => {
            const bucket: IDecoratedBucket = newDecoratedBucket({
                itemsLimit: 2,
                items: [
                    newDecoratedBucketItem({
                        localIdentifier: "m1",
                    }),
                    newDecoratedBucketItem({
                        localIdentifier: "m2",
                    }),
                ],
            });
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES);

            const result = isWithinLimit(context);

            expect(result).toEqual(false);
        });

        it("should return true when bucket contains derived & master items and itemsLimit is 2", () => {
            const bucket: IDecoratedBucket = newDecoratedBucket({
                itemsLimit: 3,
                items: [
                    newDecoratedBucketItem({
                        localIdentifier: "m1",
                        isDerived: true,
                    }),
                    newDecoratedBucketItem({
                        localIdentifier: "m2",
                    }),
                ],
            });
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES);

            const result = isWithinLimit(context);

            expect(result).toEqual(true);
        });

        it("should return true when bucket contains one master item and itemsLimit is 2", () => {
            const bucket: IDecoratedBucket = newDecoratedBucket({
                itemsLimit: 2,
                items: [
                    newDecoratedBucketItem({
                        localIdentifier: "m1",
                    }),
                ],
            });
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES);

            const result = isWithinLimit(context);

            expect(result).toEqual(true);
        });

        it("should return 'true' if there is no type specific limit and itemsLimit used as fallback", () => {
            const bucket: IDecoratedBucket = newDecoratedBucket({
                itemsLimit: 2,
                items: [
                    newDecoratedBucketItem({
                        localIdentifier: "a1",
                        attribute: {
                            type: "date",
                        },
                    }),
                ],
            });
            const context = buildCatalogItemDropContext(dateItem, bucket, MEASURES);

            const result = isWithinLimit(context);

            expect(result).toEqual(true);
        });

        it("should return 'true' if there is higher type specific limit", () => {
            const bucket: IDecoratedBucket = newDecoratedBucket({
                itemsLimit: 3,
                itemsLimitByType: {
                    date: 2,
                },
                items: [
                    newDecoratedBucketItem({
                        localIdentifier: "a1",
                        attribute: {
                            type: "date",
                        },
                    }),
                ],
            });
            const context = buildCatalogItemDropContext(dateItem, bucket, MEASURES);

            const result = isWithinLimit(context);

            expect(result).toEqual(true);
        });

        it("should return 'false' if there is lower type specific limit", () => {
            const bucket: IDecoratedBucket = newDecoratedBucket({
                itemsLimit: 3,
                itemsLimitByType: {
                    date: 1,
                },
                items: [
                    newDecoratedBucketItem({
                        localIdentifier: "a1",
                        attribute: {
                            type: "date",
                        },
                    }),
                ],
            });
            const context = buildCatalogItemDropContext(dateItem, bucket, MEASURES);

            const result = isWithinLimit(context);

            expect(result).toEqual(false);
        });
    });

    describe("isAllowedToAdd", () => {
        it("should accept an attribute in metrics", () => {
            const catalogItem: ICatalogEntry = {
                identifier: "attr_identifier",
                type: ATTRIBUTE,
            };
            const bucket = decoratedBuckets[0];
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES);

            const result = isAllowedToAdd(context, decoratedBuckets);

            expect(result).toEqual(true);
        });

        it("should bucket accept attribute having location display form", () => {
            const catalogItem: ICatalogEntry = {
                identifier: "attr_identifier",
                type: ATTRIBUTE,
                isLocationIconVisible: true,
            };

            const bucket = decoratedBuckets[3];
            const context = buildCatalogItemDropContext(catalogItem, bucket, LOCATION);

            const result = isAllowedToAdd(context, decoratedBuckets);

            expect(result).toEqual(true);
        });

        it("should accept a computed attribute wherever an attribute is accepted", () => {
            const catalogItem: ICatalogEntry = {
                identifier: "computed_attr_identifier",
                type: COMPUTED_ATTRIBUTE,
            };
            const viewBucket = decoratedBuckets[1];
            const stackBucket = decoratedBuckets[2];

            expect(
                isAllowedToAdd(buildCatalogItemDropContext(catalogItem, viewBucket, VIEW), decoratedBuckets),
            ).toEqual(true);
            expect(
                isAllowedToAdd(
                    buildCatalogItemDropContext(catalogItem, stackBucket, STACK),
                    decoratedBuckets,
                ),
            ).toEqual(true);
        });

        it("should accept a computed attribute in a measure bucket", () => {
            // the measures bucket takes an attribute in order to coerce it into COUNT(attribute), and
            // a computed attribute is counted exactly the same way
            const catalogItem: ICatalogEntry = {
                identifier: "computed_attr_identifier",
                type: COMPUTED_ATTRIBUTE,
            };
            const context = buildCatalogItemDropContext(catalogItem, decoratedBuckets[0], MEASURES);

            expect(isAllowedToAdd(context, decoratedBuckets)).toEqual(true);
        });

        it("should not accept a computed attribute bucket item moved into a measure bucket", () => {
            const bucketItem: IRawBucketItem = { type: ATTRIBUTE, isComputedAttribute: true };
            const context = buildBucketItemDropContext(
                bucketItem,
                { identifier: "computed_attr_identifier", type: ATTRIBUTE, isComputedAttribute: true },
                decoratedBuckets[0],
                VIEW,
                MEASURES,
            );

            expect(isAllowedToAdd(context, decoratedBuckets)).toEqual(false);
        });

        it("should accept a computed attribute in a bucket whose accepts list names only the attribute", () => {
            // no `accepts` list names the computed attribute type - the dragged type is normalized
            const catalogItem: ICatalogEntry = {
                identifier: "computed_attr_identifier",
                type: COMPUTED_ATTRIBUTE,
            };
            const bucket = updateBucket(decoratedBuckets, 1, { accepts: [ATTRIBUTE, DATE] })[1];

            expect(
                isAllowedToAdd(buildCatalogItemDropContext(catalogItem, bucket, VIEW), decoratedBuckets),
            ).toEqual(true);
        });

        it("should refuse a computed attribute in the geo location and area buckets", () => {
            // The dragged type is normalized to ATTRIBUTE, so what keeps the geo buckets closed is
            // their own accepts list: naming GEO_ATTRIBUTE makes isAcceptedByBucket demand geo
            // display forms, which a computed attribute has none of. The accepts lists here mirror
            // the real uiConfig (location `[ATTRIBUTE, GEO_ATTRIBUTE]`, area `[GEO_ATTRIBUTE]`) —
            // the shared fixture's location bucket omits GEO_ATTRIBUTE and would not prove anything.
            const catalogItem: ICatalogEntry = {
                identifier: "computed_attr_identifier",
                type: COMPUTED_ATTRIBUTE,
            };

            const locationBuckets = updateBucket(decoratedBuckets, 3, {
                accepts: [ATTRIBUTE, GEO_ATTRIBUTE],
            });
            expect(
                isAllowedToAdd(
                    buildCatalogItemDropContext(catalogItem, locationBuckets[3], LOCATION),
                    locationBuckets,
                ),
            ).toEqual(false);

            const areaBuckets = updateBucket(decoratedBuckets, 3, {
                localIdentifier: "area",
                accepts: [GEO_ATTRIBUTE],
            });
            expect(
                isAllowedToAdd(buildCatalogItemDropContext(catalogItem, areaBuckets[3], "area"), areaBuckets),
            ).toEqual(false);
        });

        it("should count a computed attribute towards the attribute item limit", () => {
            const catalogItem: ICatalogEntry = {
                identifier: "computed_attr_identifier",
                type: COMPUTED_ATTRIBUTE,
            };
            // a bucket already holding one attribute-like item, with a limit of one
            const bucket = updateBucket(decoratedBuckets, 1, {
                itemsLimit: 1,
                items: [newDecoratedBucketItem({ localIdentifier: "a1" })],
            })[1];

            expect(
                isAllowedToAdd(buildCatalogItemDropContext(catalogItem, bucket, VIEW), decoratedBuckets),
            ).toEqual(false);
        });

        it("should not accept a computed attribute in a bucket that does not accept attributes", () => {
            const catalogItem: ICatalogEntry = {
                identifier: "computed_attr_identifier",
                type: COMPUTED_ATTRIBUTE,
            };
            const bucket = updateBucket(decoratedBuckets, 1, { accepts: [DATE] })[1];
            const context = buildCatalogItemDropContext(catalogItem, bucket, VIEW);

            expect(isAllowedToAdd(context, decoratedBuckets)).toEqual(false);
        });

        it("should accept a date in categories", () => {
            const catalogItem: ICatalogEntry = {
                identifier: DATE_DATASET_ATTRIBUTE,
                type: DATE,
            };
            const bucket = decoratedBuckets[1];
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should not accept a fact in categories", () => {
            const catalogItem: ICatalogEntry = {
                identifier: "fact_identifier",
                type: FACT,
            };
            const bucket = decoratedBuckets[1];
            const context = buildCatalogItemDropContext(catalogItem, bucket, VIEW);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should not accept second attribute in stacks", () => {
            decoratedBuckets = updateBucket(decoratedBuckets, 2, { items: [dummyDecoratedBucketItem] });
            const bucket = decoratedBuckets[2];
            const catalogItem: ICatalogEntry = {
                identifier: "other_attribute_identifier",
                type: ATTRIBUTE,
            };
            const context = buildCatalogItemDropContext(catalogItem, bucket, STACK);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should accept different attribute in filters", () => {
            decoratedFilterBucket = {
                ...decoratedFilterBucket,
                items: [newDecoratedBucketItem({ attribute: { identifier: DATE_DATASET_ATTRIBUTE } })],
            };
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier",
                type: ATTRIBUTE,
            };
            const context = buildCatalogItemDropContext(catalogItem, decoratedFilterBucket, FILTERS);

            const isAllowed = isAllowedToAdd(context, [decoratedFilterBucket]);

            expect(isAllowed).toEqual(true);
        });

        it("should accept the same attribute in metrics", () => {
            const CATALOG_ITEM_ID = "catalog_item_identifier";
            decoratedBuckets = updateBucket(decoratedBuckets, 0, {
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: CATALOG_ITEM_ID,
                        },
                    }),
                ],
            });
            const bucket = decoratedBuckets[0];
            const catalogItem: ICatalogEntry = {
                identifier: CATALOG_ITEM_ID,
                type: ATTRIBUTE,
            };
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should accept the same attribute in categories", () => {
            const CATALOG_ITEM_ID = "catalog_item_identifier";
            decoratedBuckets = updateBucket(decoratedBuckets, 1, {
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: CATALOG_ITEM_ID,
                        },
                    }),
                ],
                itemsLimit: 10,
            });
            const bucket = decoratedBuckets[1];
            const catalogItem: ICatalogEntry = {
                identifier: CATALOG_ITEM_ID,
                type: ATTRIBUTE,
            };
            const context = buildCatalogItemDropContext(catalogItem, bucket, VIEW);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should not accept the same item [date]", () => {
            decoratedFilterBucket = {
                ...decoratedFilterBucket,
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: DATE_DATASET_ATTRIBUTE,
                            type: "date",
                        },
                    }),
                ],
                allowsDuplicateItems: true,
            };
            const catalogItem: ICatalogEntry = {
                identifier: DATE_DATASET_ATTRIBUTE,
                type: DATE,
            };
            const context = buildCatalogItemDropContext(catalogItem, decoratedFilterBucket, FILTERS);
            const isAllowed = isAllowedToAdd(context, [decoratedFilterBucket]);

            expect(isAllowed).toEqual(false);
        });

        it("should not allow drop of bucket item into metrics", () => {
            const bucketItem = buildBucketItem(ATTRIBUTE);
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier",
                type: ATTRIBUTE,
            };

            const bucket = decoratedBuckets[0];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, ATTRIBUTE, MEASURES);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should allow drop of stacks bucket item into categories", () => {
            const bucketItem = buildBucketItem(ATTRIBUTE);
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier",
                type: ATTRIBUTE,
            };
            const bucket = decoratedBuckets[2];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, STACK, VIEW);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should not allow drop of metric bucket item into categories", () => {
            const bucketItem = buildBucketItem(METRIC);
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier",
                type: ATTRIBUTE,
            };
            const bucket = decoratedBuckets[0];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, MEASURES, VIEW);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should not allow swap within the same bucket", () => {
            const bucketItem = buildBucketItem(ATTRIBUTE);
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier",
                type: ATTRIBUTE,
            };
            const bucket = decoratedBuckets[1];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, VIEW, VIEW);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should not allow to add another metric from catalog, if metrics limit is reached", () => {
            const bucketItem = newDecoratedBucketItem({
                attribute: { identifier: "metric_identifier" },
            });
            const items = times(20, constant(bucketItem));
            decoratedBuckets = updateBucket(decoratedBuckets, 0, { items });
            const item = {
                type: FACT,
            };
            const bucket = decoratedBuckets[0];
            const context = buildCatalogItemDropContext(item, bucket, MEASURES);

            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should not allow to swap bucket items when dest bucket is not accepting item type", () => {
            const bucketItem = buildBucketItem(METRIC);
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier",
                type: ATTRIBUTE,
            };
            const updatedBuckets = updateBucket(decoratedBuckets, 0, { allowsSwapping: true });
            const bucket = updatedBuckets[1];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, MEASURES, VIEW);

            const isAllowed = isAllowedToAdd(context, updatedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should allow area attribute in geo-only bucket", () => {
            const geoBucketIndex = 3;
            const geoBuckets = updateBucket(decoratedBuckets, geoBucketIndex, {
                accepts: [GEO_ATTRIBUTE],
                localIdentifier: "area",
            });
            const bucket = geoBuckets[geoBucketIndex];
            const catalogItem: ICatalogEntry = buildAreaCatalogItem();

            const context = buildCatalogItemDropContext(catalogItem, bucket, "area");
            const isAllowed = isAllowedToAdd(context, geoBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should block non-geo attributes for geo-only bucket", () => {
            const geoBucketIndex = 3;
            const geoBuckets = updateBucket(decoratedBuckets, geoBucketIndex, {
                accepts: [GEO_ATTRIBUTE],
                localIdentifier: "area",
            });
            const bucket = geoBuckets[geoBucketIndex];
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier",
                type: ATTRIBUTE,
            };

            const context = buildCatalogItemDropContext(catalogItem, bucket, "area");
            const isAllowed = isAllowedToAdd(context, geoBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should not allow location-only attributes in area bucket", () => {
            const geoBucketIndex = 3;
            const geoBuckets = updateBucket(decoratedBuckets, geoBucketIndex, {
                accepts: [GEO_ATTRIBUTE],
                localIdentifier: "area",
            });
            const bucket = geoBuckets[geoBucketIndex];
            const catalogItem: ICatalogEntry = buildLocationCatalogItem();

            const context = buildCatalogItemDropContext(catalogItem, bucket, "area");
            const isAllowed = isAllowedToAdd(context, geoBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should not allow area attributes in location bucket even with geo icon flag", () => {
            const bucket = decoratedBuckets[3];
            const catalogItem: ICatalogEntry = buildAreaCatalogItem();

            const context = buildCatalogItemDropContext(catalogItem, bucket, LOCATION);
            const isAllowed = isAllowedToAdd(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });
    });

    describe("isAllowedToReplace", () => {
        it("should accept an attribute", () => {
            const catalogItem: ICatalogEntry = {
                type: ATTRIBUTE,
                identifier: "attribute_identifier",
            };
            const bucket = decoratedBuckets[0];
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should bucket accept attribute having location display form", () => {
            const catalogItem: ICatalogEntry = {
                type: ATTRIBUTE,
                identifier: "attribute_identifier",
                isLocationIconVisible: true,
            };
            const bucket = decoratedBuckets[0];
            const context = buildCatalogItemDropContext(catalogItem, bucket, LOCATION);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should accept a date", () => {
            const catalogItem: ICatalogEntry = {
                identifier: DATE_DATASET_ATTRIBUTE,
                type: DATE,
            };
            const bucket = decoratedBuckets[1];
            const context = buildCatalogItemDropContext(catalogItem, bucket, VIEW, dummyDestBucketItem);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should not accept a fact", () => {
            const catalogItem: ICatalogEntry = {
                type: FACT,
                identifier: "fact_identifier",
            };
            const bucket = decoratedBuckets[1];
            const context = buildCatalogItemDropContext(catalogItem, bucket, VIEW, dummyDestBucketItem);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should accept different item", () => {
            const destBucketItem: IRawBucketItem = {
                attribute: "attribute_identifier_1",
                type: ATTRIBUTE,
            };
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier_2",
                type: ATTRIBUTE,
            };
            const bucket = decoratedBuckets[0];
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES, destBucketItem);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should accept different item [more items in bucket]", () => {
            const destBucketItem: IRawBucketItem = {
                attribute: "attribute_identifier_1",
                type: ATTRIBUTE,
            };
            decoratedBuckets = updateBucket(decoratedBuckets, 0, {
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: "attribute_identifier_1",
                        },
                    }),
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: "attribute_identifier_2",
                        },
                    }),
                ],
            });
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier_3",
                type: ATTRIBUTE,
            };
            const bucket = decoratedBuckets[0];
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES, destBucketItem);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should accept the same item in categories", () => {
            const CATALOG_ITEM_ID = "catalog_item_identifier";
            const destBucketItem = {
                attribute: CATALOG_ITEM_ID,
            };
            decoratedBuckets = updateBucket(decoratedBuckets, 1, {
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: CATALOG_ITEM_ID,
                        },
                    }),
                ],
            });
            const catalogItem: ICatalogEntry = {
                identifier: CATALOG_ITEM_ID,
                type: ATTRIBUTE,
            };
            const bucket = decoratedBuckets[1];
            const context = buildCatalogItemDropContext(catalogItem, bucket, VIEW, destBucketItem);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should accept the same item in metrics", () => {
            const CATALOG_ITEM_ID = "catalog_item_identifier";
            decoratedBuckets = updateBucket(decoratedBuckets, 0, {
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: CATALOG_ITEM_ID,
                        },
                    }),
                ],
            });
            const catalogItem: ICatalogEntry = {
                identifier: CATALOG_ITEM_ID,
                type: ATTRIBUTE,
            };
            const destBucketItem = {
                attribute: CATALOG_ITEM_ID,
                type: METRIC,
            };
            const bucket = decoratedBuckets[0];
            const context = buildCatalogItemDropContext(catalogItem, bucket, MEASURES, destBucketItem);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should not accept the same item [date]", () => {
            const destBucketItem: IRawBucketItem = {
                attribute: DATE_DATASET_ATTRIBUTE,
                type: DATE,
            };
            decoratedBuckets = updateBucket(decoratedBuckets, 1, {
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: DATE_DATASET_ATTRIBUTE,
                            type: "date",
                        },
                    }),
                ],
            });
            const catalogItem: ICatalogEntry = {
                identifier: DATE_DATASET_ATTRIBUTE,
                type: DATE,
            };
            const bucket = decoratedBuckets[1];
            const context = buildCatalogItemDropContext(catalogItem, bucket, VIEW, destBucketItem);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should not accept if there is date already [date]", () => {
            const otherItem = newDecoratedBucketItem({
                attribute: { identifier: "catalog_item_identifier" },
            });
            const destBucketItem: IRawBucketItem = {
                attribute: DATE_DATASET_ATTRIBUTE,
                type: DATE,
            };
            decoratedBuckets = updateBucket(decoratedBuckets, 1, {
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: DATE_DATASET_ATTRIBUTE,
                            type: "date",
                        },
                    }),
                    otherItem,
                ],
            });
            const catalogItem: ICatalogEntry = {
                identifier: DATE_DATASET_ATTRIBUTE,
                type: DATE,
            };
            const bucket = decoratedBuckets[1];
            const context = buildCatalogItemDropContext(catalogItem, bucket, VIEW, destBucketItem);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should not allow swap of bucket item into metrics", () => {
            decoratedBuckets = updateBucket(decoratedBuckets, 0, {
                items: [newDecoratedBucketItem()],
            });
            const bucketItem = buildBucketItem(ATTRIBUTE);
            const catalogItem: ICatalogEntry = {
                identifier: "catalog_item_identifier",
                type: ATTRIBUTE,
            };
            const bucket = decoratedBuckets[0];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, STACK, MEASURES);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should allow swap of bucket item into categories", () => {
            const destBucketItem: IRawBucketItem = {
                attribute: "catalog_item_identifier",
            };
            decoratedBuckets = updateBucket(decoratedBuckets, 1, {
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: "catalog_item_identifier",
                        },
                    }),
                ],
            });
            const bucketItem = buildBucketItem(ATTRIBUTE);
            const catalogItem: ICatalogEntry = {
                identifier: "another_item_identifier",
                type: "attribute",
            };
            const bucket = decoratedBuckets[1];
            const context = buildBucketItemDropContext(
                bucketItem,
                catalogItem,
                bucket,
                STACK,
                VIEW,
                destBucketItem,
            );

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should not allow swap of bucket item from metrics", () => {
            const destBucketItem: IRawBucketItem = {
                attribute: "catalog_item_identifier",
            };
            decoratedBuckets = updateBucket(decoratedBuckets, 1, {
                items: [
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: "catalog_item_identifier",
                        },
                    }),
                ],
            });
            const bucketItem = buildBucketItem(ATTRIBUTE);
            const catalogItem: ICatalogEntry = {
                identifier: "another_item_identifier",
                type: "attribute",
            };
            const bucket = decoratedBuckets[1];
            const context = buildBucketItemDropContext(
                bucketItem,
                catalogItem,
                bucket,
                MEASURES,
                VIEW,
                destBucketItem,
            );

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should not allow swap within the same bucket", () => {
            const bucketItem = buildBucketItem(ATTRIBUTE);
            const catalogItem: ICatalogEntry = {
                identifier: "attribute_identifier",
                type: ATTRIBUTE,
            };
            const bucket = decoratedBuckets[1];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, VIEW, VIEW);

            const isAllowed = isAllowedToReplace(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });
    });

    describe("isAllowedToReorder", () => {
        it("should allow reorder in metrics", () => {
            const bucketItem = {
                attribute: "fact_identifier",
                type: METRIC,
            };
            decoratedBuckets = updateBucket(decoratedBuckets, 0, {
                items: [newDecoratedBucketItem({ attribute: { identifier: "fact_identifier" } })],
            });
            const catalogItem: ICatalogEntry = {
                type: FACT,
            };
            const bucket = decoratedBuckets[0];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, MEASURES, MEASURES);

            const isAllowed = isAllowedToReorder(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should not allow reorder between different buckets", () => {
            const bucketItem = {
                attribute: "measure_identifier",
                type: METRIC,
            };
            decoratedBuckets = updateBucket(decoratedBuckets, 0, {
                items: [newDecoratedBucketItem({ attribute: { identifier: "measure_identifier" } })],
            });
            const catalogItem: ICatalogEntry = {
                type: FACT,
                identifier: "catalog_item_identifier",
            };
            const bucket = decoratedBuckets[0];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, VIEW, MEASURES);

            const isAllowed = isAllowedToReorder(context, decoratedBuckets);

            expect(isAllowed).toEqual(false);
        });

        it("should allow reordering, even if metrics limit is reached", () => {
            const bucketItem = {
                attribute: "measure_identifier",
                type: METRIC,
            };
            const items = times(
                20,
                constant(newDecoratedBucketItem({ attribute: { identifier: "measure_identifier" } })),
            );
            decoratedBuckets = updateBucket(decoratedBuckets, 0, { items });
            const catalogItem: ICatalogEntry = {
                type: FACT,
                identifier: "catalog_item_identifier",
            };
            const bucket = decoratedBuckets[0];
            const context = buildBucketItemDropContext(bucketItem, catalogItem, bucket, MEASURES, MEASURES);

            const isAllowed = isAllowedToReorder(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });

        it("should allow reordering of date item within bucket", () => {
            const bucketItem = {
                attribute: "attribute_identifier",
                type: ATTRIBUTE,
            };
            // the production factory rather than a hand-rolled shape: on a cache entry `attribute`
            // is the `attr.datedataset` STRING, not the object a decorated bucket item carries
            const dateItem = createDateItem();
            decoratedBuckets = updateBucket(decoratedBuckets, 1, {
                items: [
                    newDecoratedBucketItem({ attribute: { identifier: "attribute_identifier" } }),
                    newDecoratedBucketItem({
                        attribute: {
                            identifier: DATE_DATASET_ATTRIBUTE,
                        },
                    }),
                ],
            });
            const bucket = decoratedBuckets[1];
            const context = buildBucketItemDropContext(bucketItem, dateItem, bucket, VIEW, VIEW);

            const isAllowed = isAllowedToReorder(context, decoratedBuckets);

            expect(isAllowed).toEqual(true);
        });
    });

    describe("isAccepted", () => {
        const measureBucket: IDecoratedBucket = newDecoratedBucket({
            accepts: [METRIC],
        });
        const attributeBucket: IDecoratedBucket = newDecoratedBucket({
            accepts: [ATTRIBUTE],
        });
        const measureCatalogItem: ICatalogEntry = {
            type: METRIC,
        };
        const attributeCatalogItem: ICatalogEntry = {
            type: ATTRIBUTE,
        };

        describe("dragging catalog item", () => {
            it("should return true when item type is accepted by the bucket", () => {
                const context = buildCatalogItemDropContext(measureCatalogItem, measureBucket, MEASURES);

                const result = isAccepted(context);

                expect(result).toBe(true);
            });

            it("should return false when item type is not accepted by the bucket", () => {
                const context = buildCatalogItemDropContext(attributeCatalogItem, measureBucket, MEASURES);

                const result = isAccepted(context);

                expect(result).toBe(false);
            });
        });

        describe("dragging bucket item", () => {
            describe("dragged item is attribute", () => {
                it("should not allow to drop item to measure bucket", () => {
                    const bucketItem = buildBucketItem(ATTRIBUTE);
                    const catalogItem: ICatalogEntry = {
                        identifier: "attribute_identifier",
                        type: ATTRIBUTE,
                    };
                    const bucket = decoratedBuckets[0];
                    const context = buildBucketItemDropContext(
                        bucketItem,
                        catalogItem,
                        bucket,
                        STACK,
                        MEASURES,
                    );

                    const result = isAccepted(context);

                    expect(result).toEqual(false);
                });
            });

            describe("dragged item is not an arithmetic measure", () => {
                it("should return true when item type is accepted by the bucket", () => {
                    const bucketItem = buildBucketItem(METRIC);
                    const context = buildBucketItemDropContext(
                        bucketItem,
                        measureCatalogItem,
                        measureBucket,
                        MEASURES,
                        MEASURES,
                    );

                    const result = isAccepted(context);

                    expect(result).toBe(true);
                });

                it("should return false when item type is not accepted by the bucket", () => {
                    const bucketItem = buildBucketItem(METRIC);
                    const context = buildBucketItemDropContext(
                        bucketItem,
                        attributeCatalogItem,
                        measureBucket,
                        MEASURES,
                        ATTRIBUTES,
                    );

                    const result = isAccepted(context);

                    expect(result).toBe(false);
                });
            });

            describe("dragged item is an arithmetic measure", () => {
                it("should return true when measures are accepted by the bucket", () => {
                    const bucketItem = buildBucketItem(METRIC);
                    const context = buildBucketItemDropContext(
                        bucketItem,
                        null,
                        measureBucket,
                        MEASURES,
                        MEASURES,
                    );

                    const result = isAccepted(context);

                    expect(result).toBe(true);
                });

                it("should return false when measures are not accepted by the bucket", () => {
                    const bucketItem = buildBucketItem(METRIC);
                    const context = buildBucketItemDropContext(
                        bucketItem,
                        null,
                        attributeBucket,
                        MEASURES,
                        ATTRIBUTES,
                    );

                    const result = isAccepted(context);

                    expect(result).toBe(false);
                });
            });

            describe("dragged item is an derived measure created from arithmetic measure", () => {
                it("should return true when measures are accepted by the bucket", () => {
                    const bucketItem = buildBucketItem(METRIC);
                    const context = buildBucketItemDropContext(
                        bucketItem,
                        null,
                        measureBucket,
                        MEASURES,
                        MEASURES,
                    );

                    const result = isAccepted(context);

                    expect(result).toBe(true);
                });

                it("should return false when measures are not accepted by the bucket", () => {
                    const bucketItem = buildBucketItem(METRIC);
                    const context = buildBucketItemDropContext(
                        bucketItem,
                        null,
                        attributeBucket,
                        MEASURES,
                        ATTRIBUTES,
                    );

                    const result = isAccepted(context);

                    expect(result).toBe(false);
                });
            });
        });
    });
});
