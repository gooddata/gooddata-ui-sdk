// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IExtendedReferencePoint, type IReferencePoint } from "@gooddata/sdk-ui-ext/internal";

import { ATTRIBUTE, FACT } from "../../../constants/bucket.js";
import {
    DEFAULT_DECIMAL_FORMAT,
    DEFAULT_INTEGER_FORMAT,
    DEFAULT_PERCENTAGE_FORMAT,
} from "../../../constants/formats.js";
import { ArithmeticOperatorType } from "../../../typings/arithmetic_measure.js";
import { type IBucketItem } from "../../../typings/metadata.js";

import { sanitizeMeasureFormatForCatalogType, sanitizeReferencePointFormats } from "./measure_format.js";

const measure = (props: Partial<IBucketItem>): IBucketItem => props as IBucketItem;

describe("sanitizeMeasureFormatForCatalogType", () => {
    describe("catalog-backed measures (the showInPercent trigger)", () => {
        it("switches a fact from its decimal default to the percentage format", () => {
            const previous = measure({ showInPercent: false, format: DEFAULT_DECIMAL_FORMAT });
            const current = measure({ showInPercent: true, format: DEFAULT_DECIMAL_FORMAT });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, FACT)).toEqual({
                showInPercent: true,
                format: DEFAULT_PERCENTAGE_FORMAT,
            });
        });

        it("switches a fact back from the percentage format to its decimal default", () => {
            const previous = measure({ showInPercent: true, format: DEFAULT_PERCENTAGE_FORMAT });
            const current = measure({ showInPercent: false, format: DEFAULT_PERCENTAGE_FORMAT });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, FACT).format).toBe(
                DEFAULT_DECIMAL_FORMAT,
            );
        });

        it("uses the integer default for an attribute-backed measure", () => {
            const previous = measure({ showInPercent: true, format: DEFAULT_PERCENTAGE_FORMAT });
            const current = measure({ showInPercent: false, format: DEFAULT_PERCENTAGE_FORMAT });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, ATTRIBUTE).format).toBe(
                DEFAULT_INTEGER_FORMAT,
            );
        });

        it("clears the format to null for a metric, whose default format is null", () => {
            const previous = measure({ showInPercent: true, format: DEFAULT_PERCENTAGE_FORMAT });
            const current = measure({ showInPercent: false, format: DEFAULT_PERCENTAGE_FORMAT });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, "measure").format).toBeNull();
        });

        it("returns the very same measure when showInPercent did not change", () => {
            const previous = measure({ showInPercent: true, format: DEFAULT_DECIMAL_FORMAT });
            const current = measure({ showInPercent: true, format: "whatever" });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, FACT)).toBe(current);
        });

        it("keeps a format the user had set to something other than the previous default", () => {
            const previous = measure({ showInPercent: false, format: "custom" });
            const current = measure({ showInPercent: true, format: "custom" });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, FACT)).toBe(current);
        });

        it("re-formats when the previous format was absent, because there is nothing to preserve", () => {
            const previous = measure({ showInPercent: false });
            const current = measure({ showInPercent: true });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, FACT).format).toBe(
                DEFAULT_PERCENTAGE_FORMAT,
            );
        });
    });

    describe("arithmetic measures (the operator trigger, selected by a missing catalog type)", () => {
        it("switches a ratio turned into a change to the percentage format", () => {
            const previous = measure({
                operator: ArithmeticOperatorType.RATIO,
                format: DEFAULT_DECIMAL_FORMAT,
            });
            const current = measure({
                operator: ArithmeticOperatorType.CHANGE,
                format: DEFAULT_DECIMAL_FORMAT,
            });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, undefined).format).toBe(
                DEFAULT_PERCENTAGE_FORMAT,
            );
        });

        it("switches a change turned into a sum back to the decimal format", () => {
            const previous = measure({
                operator: ArithmeticOperatorType.CHANGE,
                format: DEFAULT_PERCENTAGE_FORMAT,
            });
            const current = measure({
                operator: ArithmeticOperatorType.SUM,
                format: DEFAULT_PERCENTAGE_FORMAT,
            });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, undefined).format).toBe(
                DEFAULT_DECIMAL_FORMAT,
            );
        });

        it("returns the very same measure when the operator did not change", () => {
            const previous = measure({ operator: ArithmeticOperatorType.RATIO });
            const current = measure({ operator: ArithmeticOperatorType.RATIO, format: "whatever" });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, undefined)).toBe(current);
        });

        it("keeps a user format on an arithmetic measure too", () => {
            const previous = measure({ operator: ArithmeticOperatorType.RATIO, format: "custom" });
            const current = measure({ operator: ArithmeticOperatorType.CHANGE, format: "custom" });

            expect(sanitizeMeasureFormatForCatalogType(previous, current, undefined)).toBe(current);
        });
    });
});

describe("sanitizeReferencePointFormats", () => {
    const referencePoint = (items: IBucketItem[]): IExtendedReferencePoint =>
        ({
            buckets: [{ localIdentifier: "measures", items }],
            properties: { some: "property" },
        }) as unknown as IExtendedReferencePoint;

    // every measure in these fixtures resolves to a fact, so showInPercent drives the format
    const asFact = () => FACT;

    it("returns the reference point itself when it carries no buckets", () => {
        const extendedReferencePoint = {} as IExtendedReferencePoint;

        expect(sanitizeReferencePointFormats({} as IReferencePoint, extendedReferencePoint, asFact)).toBe(
            extendedReferencePoint,
        );
    });

    it("re-formats the items that have a previous counterpart", () => {
        const previous = referencePoint([
            measure({ localIdentifier: "m1", showInPercent: false, format: DEFAULT_DECIMAL_FORMAT }),
        ]) as unknown as IReferencePoint;
        const current = referencePoint([
            measure({ localIdentifier: "m1", showInPercent: true, format: DEFAULT_DECIMAL_FORMAT }),
        ]);

        const result = sanitizeReferencePointFormats(previous, current, asFact);

        expect(result.buckets[0].items[0].format).toBe(DEFAULT_PERCENTAGE_FORMAT);
    });

    it("leaves an item without a previous counterpart exactly as it came in", () => {
        const previous = referencePoint([]) as unknown as IReferencePoint;
        const current = referencePoint([
            measure({ localIdentifier: "new", showInPercent: true, format: DEFAULT_DECIMAL_FORMAT }),
        ]);

        const result = sanitizeReferencePointFormats(previous, current, asFact);

        expect(result.buckets[0].items[0]).toBe(current.buckets[0].items[0]);
    });

    it("pairs items by local identifier across buckets, not by position", () => {
        const previous = {
            buckets: [
                { localIdentifier: "measures", items: [] },
                {
                    localIdentifier: "secondary_measures",
                    items: [
                        measure({
                            localIdentifier: "m1",
                            showInPercent: false,
                            format: DEFAULT_DECIMAL_FORMAT,
                        }),
                    ],
                },
            ],
        } as unknown as IReferencePoint;
        const current = referencePoint([
            measure({ localIdentifier: "m1", showInPercent: true, format: DEFAULT_DECIMAL_FORMAT }),
        ]);

        // m1 moved from the secondary bucket to the primary one; its previous configuration still counts
        expect(sanitizeReferencePointFormats(previous, current, asFact).buckets[0].items[0].format).toBe(
            DEFAULT_PERCENTAGE_FORMAT,
        );
    });

    it("does not mutate the reference point it was given", () => {
        const previous = referencePoint([
            measure({ localIdentifier: "m1", showInPercent: false, format: DEFAULT_DECIMAL_FORMAT }),
        ]) as unknown as IReferencePoint;
        const current = referencePoint([
            measure({ localIdentifier: "m1", showInPercent: true, format: DEFAULT_DECIMAL_FORMAT }),
        ]);

        const result = sanitizeReferencePointFormats(previous, current, asFact);

        expect(result).not.toBe(current);
        expect(current.buckets[0].items[0].format).toBe(DEFAULT_DECIMAL_FORMAT);
        // everything outside buckets survives the clone
        expect(result).toHaveProperty("properties", { some: "property" });
    });

    it("asks the resolver for each item's own catalog type", () => {
        const asked: string[] = [];
        const previous = referencePoint([
            measure({ localIdentifier: "m1", attribute: "fact1", showInPercent: false }),
            measure({ localIdentifier: "m2", attribute: "am1", operator: ArithmeticOperatorType.RATIO }),
        ]) as unknown as IReferencePoint;
        const current = referencePoint([
            measure({ localIdentifier: "m1", attribute: "fact1", showInPercent: true }),
            measure({ localIdentifier: "m2", attribute: "am1", operator: ArithmeticOperatorType.CHANGE }),
        ]);

        const result = sanitizeReferencePointFormats(previous, current, (id) => {
            asked.push(id);
            return id === "fact1" ? FACT : undefined;
        });

        expect(asked).toEqual(["fact1", "am1"]);
        expect(result.buckets[0].items[0].format).toBe(DEFAULT_PERCENTAGE_FORMAT);
        // m2 has no catalog item, so it went down the arithmetic operator branch
        expect(result.buckets[0].items[1].format).toBe(DEFAULT_PERCENTAGE_FORMAT);
    });
});
