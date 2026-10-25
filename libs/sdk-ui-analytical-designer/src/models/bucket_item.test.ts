// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { ATTRIBUTE, COMPUTED_ATTRIBUTE, DATE, FACT, METRIC } from "../constants/bucket.js";
import { type IRawBucketItem } from "../typings/buckets.js";

import {
    buildBucketItem,
    buildBucketItemFromCatalogItem,
    findDerivedMeasure,
    findMasterMeasure,
    getLocalIdentifier,
    getMasterLocalIdentifier,
    getOperandLocalIdentifiers,
    getOperator,
    hasDerived,
    isArithmeticMeasure,
    isAttribute,
    isComputedAttributeItem,
    isDate,
    isDerived,
    isDerivedFrom,
    isDerivedFromArithmeticMeasure,
    isMasterMeasure,
    isMeasure,
    isValidArithmeticMeasure,
    setLocalIdentifier,
    setMasterLocalIdentifier,
} from "./bucket_item.js";

describe("Bucket Item", () => {
    const dateDatasetRef = {
        uri: "gdc/md/ref",
    };
    describe("buildBucketItemFromCatalogItem", () => {
        it("should create measure from measure catalog item", () => {
            const catalogItem = {
                identifier: "catalog_item_identifier",
                type: METRIC,
                ref: uriRef("/catalog_item_uri"),
            };
            const bucketAcceptsMeasures = true;

            const bucketItem = buildBucketItemFromCatalogItem(
                catalogItem,
                bucketAcceptsMeasures,
                dateDatasetRef,
            );

            expect(bucketItem).toEqual({
                ref: null,
                alias: null,
                aggregation: null,
                attribute: "catalog_item_identifier",
                filters: [],
                granularity: null,
                isKdaDisabled: null,
                localIdentifier: expect.stringMatching(/^[a-z0-9]{32}$/),
                masterLocalIdentifier: null,
                operandLocalIdentifiers: null,
                operator: null,
                showInPercent: null,
                showAllValues: null,
                showOnSecondaryAxis: null,
                isTotalMeasure: null,
                isThresholdMeasure: null,
                type: METRIC,
            });
        });

        it("should create measure from fact catalog item", () => {
            const catalogItem = {
                identifier: "catalog_item_identifier",
                type: FACT,
                ref: uriRef("/catalog_item_uri"),
            };
            const bucketAcceptsMeasures = true;

            const bucketItem = buildBucketItemFromCatalogItem(
                catalogItem,
                bucketAcceptsMeasures,
                dateDatasetRef,
            );

            expect(bucketItem).toEqual({
                ref: null,
                alias: null,
                aggregation: "sum",
                attribute: "catalog_item_identifier",
                filters: [],
                format: "#,##0.00",
                granularity: null,
                isKdaDisabled: null,
                localIdentifier: expect.stringMatching(/^[a-z0-9]{32}$/),
                masterLocalIdentifier: null,
                operandLocalIdentifiers: null,
                operator: null,
                showInPercent: null,
                showAllValues: null,
                showOnSecondaryAxis: null,
                isTotalMeasure: null,
                isThresholdMeasure: null,
                type: METRIC,
            });
        });

        it("should create measure from attribute catalog item when bucket accepts measures", () => {
            const catalogItem = {
                identifier: "catalog_item_identifier",
                type: ATTRIBUTE,
                ref: uriRef("/catalog_item_uri"),
            };
            const bucketAcceptsMeasures = true;

            const bucketItem = buildBucketItemFromCatalogItem(
                catalogItem,
                bucketAcceptsMeasures,
                dateDatasetRef,
            );

            expect(bucketItem).toEqual({
                ref: null,
                alias: null,
                aggregation: "count",
                attribute: "catalog_item_identifier",
                filters: [],
                format: "#,##0",
                granularity: null,
                isKdaDisabled: null,
                localIdentifier: expect.stringMatching(/^[a-z0-9]{32}$/),
                masterLocalIdentifier: null,
                operandLocalIdentifiers: null,
                operator: null,
                showInPercent: null,
                showAllValues: null,
                showOnSecondaryAxis: null,
                isTotalMeasure: null,
                isThresholdMeasure: null,
                type: METRIC,
            });
        });

        it("should create attribute from attribute catalog item when bucket does not accept measures", () => {
            const catalogItem = {
                identifier: "catalog_item_identifier",
                type: ATTRIBUTE,
                ref: uriRef("/catalog_item_uri"),
            };
            const bucketAcceptsMeasures = false;

            const bucketItem = buildBucketItemFromCatalogItem(
                catalogItem,
                bucketAcceptsMeasures,
                dateDatasetRef,
            );

            expect(bucketItem).toEqual({
                ref: uriRef("/catalog_item_uri"),
                alias: null,
                aggregation: null,
                attribute: "catalog_item_identifier",
                filters: [],
                granularity: null,
                isKdaDisabled: null,
                localIdentifier: expect.stringMatching(/^[a-z0-9]{32}$/),
                masterLocalIdentifier: null,
                operandLocalIdentifiers: null,
                operator: null,
                showInPercent: null,
                showAllValues: null,
                showOnSecondaryAxis: null,
                isTotalMeasure: null,
                isThresholdMeasure: null,
                type: ATTRIBUTE,
                dfRef: undefined,
                displayForms: undefined,
                locationDisplayFormRef: undefined,
                areaDisplayFormRef: undefined,
                isLocationIconVisible: undefined,
            });
        });

        it("should create a plain attribute bucket item from a computed attribute catalog item", () => {
            const displayForms = [
                {
                    id: "computed_attr",
                    uri: "computed_attr",
                    ref: uriRef("/computed_attr"),
                    title: "Revenue bucket",
                },
            ];
            const catalogItem = {
                identifier: "computed_attr",
                type: COMPUTED_ATTRIBUTE,
                ref: uriRef("/computed_attr"),
                dfRef: uriRef("/computed_attr"),
                displayForms,
            };

            const bucketItem = buildBucketItemFromCatalogItem(catalogItem, false, dateDatasetRef);

            expect(bucketItem).toMatchObject({
                attribute: "computed_attr",
                type: ATTRIBUTE,
                ref: uriRef("/computed_attr"),
                dfRef: uriRef("/computed_attr"),
                displayForms,
                isComputedAttribute: true,
            });
            expect(isComputedAttributeItem(bucketItem)).toBe(true);
        });

        it("should keep the computed attribute flag when the bucket transforms it to a measure", () => {
            const catalogItem = {
                identifier: "computed_attr",
                type: COMPUTED_ATTRIBUTE,
                ref: uriRef("/computed_attr"),
            };

            const bucketItem = buildBucketItemFromCatalogItem(catalogItem, true, dateDatasetRef);

            expect(bucketItem).toMatchObject({
                attribute: "computed_attr",
                type: METRIC,
                aggregation: "count",
                isComputedAttribute: true,
            });
        });

        it("should not flag a plain attribute as a computed attribute", () => {
            const bucketItem = buildBucketItemFromCatalogItem(
                { identifier: "attr", type: ATTRIBUTE, ref: uriRef("/attr") },
                false,
                dateDatasetRef,
            );

            expect(isComputedAttributeItem(bucketItem)).toBe(false);
        });

        it("should build bucket item from geo attribute catalog item", () => {
            const catalogItem = {
                identifier: "catalog_item_identifier",
                isLocationIconVisible: true,
                locationDisplayFormRef: uriRef("/geo/attribute/displayform/uri/1"),
                areaDisplayFormRef: uriRef("/geo/attribute/displayform/uri/area"),
                type: ATTRIBUTE,
                ref: uriRef("/catalog_item_uri"),
            };
            const bucketAcceptsMeasures = false;

            const bucketItem = buildBucketItemFromCatalogItem(
                catalogItem,
                bucketAcceptsMeasures,
                dateDatasetRef,
            );

            expect(bucketItem).toEqual({
                ref: uriRef("/catalog_item_uri"),
                alias: null,
                aggregation: null,
                attribute: "catalog_item_identifier",
                filters: [],
                granularity: null,
                isKdaDisabled: null,
                locationDisplayFormRef: uriRef("/geo/attribute/displayform/uri/1"),
                areaDisplayFormRef: uriRef("/geo/attribute/displayform/uri/area"),
                isLocationIconVisible: true,
                dfRef: undefined,
                displayForms: undefined,
                localIdentifier: expect.stringMatching(/^[a-z0-9]{32}$/),
                masterLocalIdentifier: null,
                operandLocalIdentifiers: null,
                operator: null,
                showInPercent: null,
                showAllValues: null,
                showOnSecondaryAxis: null,
                isTotalMeasure: null,
                isThresholdMeasure: null,
                type: ATTRIBUTE,
            });
        });

        it("should create date from date catalog item", () => {
            const catalogItem = {
                identifier: "catalog_item_identifier",
                type: DATE,
                ref: uriRef("/catalog_item_uri"),
            };
            const bucketAcceptsMeasures = false;

            const bucketItem = buildBucketItemFromCatalogItem(
                catalogItem,
                bucketAcceptsMeasures,
                dateDatasetRef,
            );

            expect(bucketItem).toEqual({
                ref: null,
                alias: null,
                aggregation: null,
                attribute: "catalog_item_identifier",
                dateDatasetRef: {
                    uri: "gdc/md/ref",
                },
                filters: [],
                granularity: null,
                isKdaDisabled: null,
                localIdentifier: expect.stringMatching(/^[a-z0-9]{32}$/),
                masterLocalIdentifier: null,
                operandLocalIdentifiers: null,
                operator: null,
                showInPercent: null,
                showAllValues: null,
                showOnSecondaryAxis: null,
                isTotalMeasure: null,
                isThresholdMeasure: null,
                type: DATE,
            });
        });

        it("should return null for unrecognized item type", () => {
            const catalogItem = {
                identifier: "catalog_item_identifier",
                type: "unknown",
                ref: uriRef("/catalog_item_uri"),
            };
            const bucketAcceptsMeasures = false;

            const bucketItem = buildBucketItemFromCatalogItem(
                catalogItem,
                bucketAcceptsMeasures,
                dateDatasetRef,
            );

            expect(bucketItem).toBeNull();
        });
    });

    describe("buildBucketItem", () => {
        it("should generate some localIdentifier", () => {
            const createdItem = buildBucketItem({
                attribute: "aaeFKXFYiCc0",
            });

            expect(typeof createdItem.localIdentifier).toBe("string");
        });

        it("should use provided localIdentifier if given", () => {
            const localIdentifier = "abc";
            const createdItem = buildBucketItem({
                attribute: "aaeFKXFYiCc0",
                localIdentifier,
            });

            expect(createdItem.localIdentifier).toEqual(localIdentifier);
        });
    });

    describe("getters and setters", () => {
        const bucketItem = {
            localIdentifier: "897b7017c60044cdaa220f2501b7d5e3",
            masterLocalIdentifier: "jhbj4hv7j5vj6hc5gcv6hg5c6h5c6hc5",
        };

        describe("getLocalIdentifier", () => {
            it("should return local identifier if it is set", () => {
                expect(getLocalIdentifier(bucketItem)).toBe("897b7017c60044cdaa220f2501b7d5e3");
            });

            it("should return provided default value if local identifier is not present", () => {
                const emptyBucketItem = {};

                const localIdentifier = getLocalIdentifier(emptyBucketItem, "default_value");

                expect(localIdentifier).toBe("default_value");
            });
        });

        describe("setLocalIdentifier", () => {
            it("should return new bucket item instance with local identifier set to new valuew", () => {
                const newBucketItem = setLocalIdentifier(bucketItem, "5e67416485ce416781e597bf4639001d");

                expect(bucketItem !== newBucketItem).toBe(true);
                expect(newBucketItem?.localIdentifier).toBe("5e67416485ce416781e597bf4639001d");
            });
        });

        describe("getMasterLocalIdentifier", () => {
            it("should return master local identifier if it is set", () => {
                expect(getMasterLocalIdentifier(bucketItem)).toBe("jhbj4hv7j5vj6hc5gcv6hg5c6h5c6hc5");
            });
        });

        describe("setMasterLocalIdentifier", () => {
            it("should return new bucket item instance with master local identifier set to new valuew", () => {
                const newBucketItem = setMasterLocalIdentifier(
                    bucketItem,
                    "5e67416485ce416781e597bf4639001d",
                );

                expect(bucketItem !== newBucketItem).toBe(true);
                expect(newBucketItem?.masterLocalIdentifier).toBe("5e67416485ce416781e597bf4639001d");
            });
        });

        describe("getOperator", () => {
            it("should return arithmetic measure operator", () => {
                const bucketItemWithOperator = { ...bucketItem, operator: "suma" };

                const operator = getOperator(bucketItemWithOperator);

                expect(operator).toEqual("suma");
            });
        });

        describe("getOperandLocalIdentifiers", () => {
            it("should return oprand as pure JS array", () => {
                const bucketItemWithOperands = {
                    ...bucketItem,
                    operandLocalIdentifiers: ["m1", "m2"],
                };
                const identifiers = getOperandLocalIdentifiers(bucketItemWithOperands);

                expect(identifiers).toEqual(["m1", "m2"]);
            });

            it("should return null when the measure is not arithmetic", () => {
                const identifiers = getOperandLocalIdentifiers(bucketItem);

                expect(identifiers).toBeNull();
            });
        });
    });

    describe("checks", () => {
        describe("isMeasure", () => {
            it.each([
                [true, METRIC],
                [false, ATTRIBUTE],
                [false, DATE],
            ])("should return %s when bucket item type=%s", (expectedResult, type) => {
                const bucketItem = { type };
                expect(isMeasure(bucketItem)).toBe(expectedResult);
            });
        });

        describe("isAttribute", () => {
            it.each([
                [false, METRIC],
                [true, ATTRIBUTE],
                [false, DATE],
            ])("should return %s when bucket item type=%s", (expectedResult, type) => {
                const bucketItem = { type };
                expect(isAttribute(bucketItem)).toBe(expectedResult);
            });
        });

        describe("isDate", () => {
            it.each([
                [false, METRIC],
                [false, ATTRIBUTE],
                [true, DATE],
            ])("should return %s when bucket item type=%s", (expectedResult, type) => {
                const bucketItem = { type };
                expect(isDate(bucketItem)).toBe(expectedResult);
            });
        });

        describe("isDerived", () => {
            it("should return true when item has set masterLocalIdentifier property", () => {
                const masterItem = { masterLocalIdentifier: "m1" };

                expect(isDerived(masterItem)).toBeTruthy();
            });

            it("should return false when item has not set masterLocalIdentifier property", () => {
                const masterItem = { localIdentifier: "m1" };

                expect(isDerived(masterItem)).toBeFalsy();
            });
        });

        describe("isDerivedFrom", () => {
            it("should return true when derived item has master item", () => {
                const derivedItem = { masterLocalIdentifier: "m1" };
                const masterItem = { localIdentifier: "m1" };

                expect(isDerivedFrom(derivedItem, masterItem)).toBeTruthy();
            });

            it("should return false when derived item has not master item", () => {
                const derivedItem = { masterLocalIdentifier: "m1" };
                const masterItem = { localIdentifier: "m2" };

                expect(isDerivedFrom(derivedItem, masterItem)).toBeFalsy();
            });

            it("should return false when passed not derived item", () => {
                const otherMasterItem = { localIdentifier: "m1" };
                const masterItem = { localIdentifier: "m2" };

                expect(isDerivedFrom(otherMasterItem, masterItem)).toBeFalsy();
            });
        });

        describe("hasDerived", () => {
            it("should return true when derived item from this item present somewhere in buckets", () => {
                const masterItem = { localIdentifier: "m1" };
                const buckets = [{ items: [masterItem] }, { items: [{ masterLocalIdentifier: "m1" }] }];

                expect(hasDerived(masterItem, buckets)).toBeTruthy();
            });

            it("should return false when derived item from this not present in buckets", () => {
                const masterItem = { localIdentifier: "m1" };
                const buckets = [{ items: [masterItem] }, { items: [{ masterLocalIdentifier: "m2" }] }];

                expect(hasDerived(masterItem, buckets)).toBeFalsy();
            });
        });

        describe("isMasterMeasure", () => {
            it("should return true when item is measure and is not derived", () => {
                const bucketItem = { type: METRIC };

                expect(isMasterMeasure(bucketItem)).toEqual(true);
            });

            it("should return false when item is not measure", () => {
                const bucketItem = { type: ATTRIBUTE };

                expect(isMasterMeasure(bucketItem)).toEqual(false);
            });

            it("should return false when item is derived measure", () => {
                const bucketItem = { type: METRIC, masterLocalIdentifier: "m1" };

                expect(isMasterMeasure(bucketItem)).toEqual(false);
            });
        });

        describe("isArithmeticMeasure", () => {
            it("should return true when operand local identifiers property is present", () => {
                const bucketItem = {
                    operandLocalIdentifiers: ["m1", "m2"],
                };

                const isArithmetic = isArithmeticMeasure(bucketItem);

                expect(isArithmetic).toBe(true);
            });

            it("should return false when operand local identifiers property is not present", () => {
                const bucketItem = {};

                const isArithmetic = isArithmeticMeasure(bucketItem);

                expect(isArithmetic).toBe(false);
            });
        });

        describe("isValidArithmeticMeasure", () => {
            it("should return false when non arithmetic measure is tested", () => {
                const bucketItem = {};

                const isValid = isValidArithmeticMeasure(bucketItem);

                expect(isValid).toBe(false);
            });

            it("should return false when one of operands is null", () => {
                const bucketItem = {
                    operandLocalIdentifiers: ["m1", null],
                };

                const isValid = isValidArithmeticMeasure(bucketItem);

                expect(isValid).toBe(false);
            });

            it("should return true when all operands are set", () => {
                const bucketItem = {
                    operandLocalIdentifiers: ["m1", "m2"],
                };

                const isValid = isValidArithmeticMeasure(bucketItem);

                expect(isValid).toBe(true);
            });
        });
    });

    describe("findDerivedMeasure", () => {
        it("should return first derived measure", () => {
            const master1 = { localIdentifier: "m1" };
            const derived1 = { localIdentifier: "m2", masterLocalIdentifier: "m4" };
            const derived2 = { localIdentifier: "m3", masterLocalIdentifier: "m4" };
            const master2 = { localIdentifier: "m4" };
            const measures = [master1, derived1, derived2, master2];

            const derived = findDerivedMeasure(master2, measures);

            expect(derived).toBe(derived1);
        });
    });

    describe("findMasterMeasure", () => {
        it("should return master measure when it exists in the buckets", () => {
            const masterMeasureItem = { localIdentifier: "m1" };
            const derivedMeasureItem = { localIdentifier: "m2", masterLocalIdentifier: "m1" };
            const buckets = [{ items: [masterMeasureItem] }, { items: [derivedMeasureItem] }];
            const matchingMasterMeasure = findMasterMeasure(derivedMeasureItem, buckets);
            expect(matchingMasterMeasure).toBe(masterMeasureItem);
        });

        it("should return undefined when master measure does not exist in the buckets", () => {
            const masterMeasureItem = { localIdentifier: "m1" };
            const derivedMeasureItem = { localIdentifier: "m2", masterLocalIdentifier: "m3" };
            const buckets = [{ items: [masterMeasureItem] }, { items: [derivedMeasureItem] }];
            const matchingMasterMeasure = findMasterMeasure(derivedMeasureItem, buckets);
            expect(matchingMasterMeasure).toBe(undefined);
        });

        it("should return undefined when provided item is not derived measure", () => {
            const masterMeasureItem = { localIdentifier: "m1" };
            const derivedMeasureItem = { localIdentifier: "m2", masterLocalIdentifier: "m1" };
            const buckets = [{ items: [masterMeasureItem] }, { items: [derivedMeasureItem] }];
            const matchingMasterMeasure = findMasterMeasure(masterMeasureItem, buckets);
            expect(matchingMasterMeasure).toBe(undefined);
        });
    });

    describe("isDerivedFromArithmeticMeasure", () => {
        const simpleMeasure = {
            localIdentifier: "m1",
            type: METRIC,
        };
        const arithmeticMeasure: IRawBucketItem = {
            localIdentifier: "m2",
            type: METRIC,
            operandLocalIdentifiers: ["m1", "m1"],
            operator: "sum",
        };

        it("should return false for simple measure", () => {
            expect(isDerivedFromArithmeticMeasure(simpleMeasure, [simpleMeasure])).toBe(false);
        });

        it("should return false for arithmetic measure made from simple measures", () => {
            expect(
                isDerivedFromArithmeticMeasure(arithmeticMeasure, [simpleMeasure, arithmeticMeasure]),
            ).toBe(false);
        });

        it("should return false for SP derived measure made from simple measure", () => {
            const spDerivedMeasure = {
                localIdentifier: "m2",
                type: METRIC,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            };
            expect(isDerivedFromArithmeticMeasure(spDerivedMeasure, [simpleMeasure, spDerivedMeasure])).toBe(
                false,
            );
        });

        it("should return false for PP derived measure made from simple measure", () => {
            const ppDerivedMeasure = {
                localIdentifier: "m2",
                type: METRIC,
                masterLocalIdentifier: "m1",
                overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            };
            expect(isDerivedFromArithmeticMeasure(ppDerivedMeasure, [simpleMeasure, ppDerivedMeasure])).toBe(
                false,
            );
        });

        it("should return true for SP derived measure made from arithmetic measure", () => {
            const derivedMeasureFromArithmetic = {
                localIdentifier: "m3",
                type: METRIC,
                masterLocalIdentifier: "m2",
                overTimeComparisonType: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            };
            const allMeasures = [simpleMeasure, arithmeticMeasure, derivedMeasureFromArithmetic];
            expect(isDerivedFromArithmeticMeasure(derivedMeasureFromArithmetic, allMeasures)).toBe(true);
        });

        it("should return true for PP derived measure made from arithmetic measure", () => {
            const derivedMeasureFromArithmetic = {
                localIdentifier: "m3",
                type: METRIC,
                masterLocalIdentifier: "m2",
                overTimeComparisonType: OverTimeComparisonTypes.PREVIOUS_PERIOD,
            };
            const allMeasures = [simpleMeasure, arithmeticMeasure, derivedMeasureFromArithmetic];
            expect(isDerivedFromArithmeticMeasure(derivedMeasureFromArithmetic, allMeasures)).toBe(true);
        });
    });
});
