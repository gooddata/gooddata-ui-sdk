// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITotal } from "@gooddata/sdk-model";
import { type IExtendedReferencePoint, type IReferencePoint } from "@gooddata/sdk-ui-ext/internal";

import { ATTRIBUTE, COLUMNS, MEASURES, METRIC, STACK, VIEW } from "../constants/bucket.js";
import { DEFAULT_DECIMAL_FORMAT, DEFAULT_PERCENTAGE_FORMAT } from "../constants/formats.js";
import { DATE_DATASET_ATTRIBUTE } from "../models/date_item.js";
import { catalogItemTypeResolver } from "../store/buckets/buckets_operation_inputs.js";
import { getMeasuresInBuckets } from "../store/buckets/buckets_read_helpers.js";
import { setBucketTotals as setBucketTotalsInBuckets } from "../store/buckets/buckets_totals_helpers.js";
import { getBucketItemsInBuckets } from "../store/buckets/buckets_write_helpers.js";
import {
    areBucketsEmpty,
    isCategoriesOrStacks,
    isDateBucketItem,
} from "../store/buckets/helpers/bucket_item_predicates.js";
import { sanitizeMeasureFormatForCatalogType } from "../store/buckets/helpers/measure_format.js";
import { initialCatalogState } from "../store/catalog/catalog_reducer.js";
import { type IAppState } from "../store/types.js";
import { catalogFact } from "../tests/catalog.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withRoot } from "../tests/state_builder.test.helpers.js";
import { visualizationClassMock } from "../tests/visualization_class.test.helpers.js";
import { ArithmeticOperatorType } from "../typings/arithmetic_measure.js";
import { type IRawBucketItem, type IRawBucketItems, type IRawBuckets } from "../typings/buckets.js";
import { type IBucketItem } from "../typings/metadata.js";

import {
    findInvalidArithmeticMeasuresForRemoval,
    getAllDependantBucketItems,
    getMeasureVisualizationTypeName,
    hasBucketDateItem,
    mirrorTotalsToDerivedMeasures,
    sanitizeFormats,
    sanitizeTotals,
} from "./buckets_service.js";

/**
 * Characterization pins for buckets_service: the measure format sanitization, the bucket queries and
 * predicates, the dependant-item walks, the totals reordering feature flag, and the
 * identity/idempotence of the buckets writes (the last describe block).
 */
describe("Buckets service characterization", () => {
    const stateWithCatalogFact = (): IAppState =>
        withData(getInitializedState(), {
            catalog: {
                ...initialCatalogState,
                items: [catalogFact],
            },
        });

    const measure = (props: Partial<IBucketItem>): IBucketItem => props as IBucketItem;

    // The whole-root `sanitizeMeasureFormat` / `setBucketTotals` adapters died with
    // their callers; these shims keep every pin running over the SAME shared implementations —
    // for the totals, state identity now follows from buckets-value identity plus the setIn
    // short-circuit, which is exactly the pair the identity pins exist for.
    const sanitizeMeasureFormat = (
        previous: IBucketItem,
        current: IBucketItem,
        state: IAppState,
    ): IBucketItem =>
        sanitizeMeasureFormatForCatalogType(
            previous,
            current,
            catalogItemTypeResolver(state)(current.attribute),
        );

    const setBucketTotals = (state: IAppState, totals: ITotal[] | undefined, bucketLocalIdentifier: string) =>
        withData(state, {
            buckets: setBucketTotalsInBuckets(state.data.buckets, totals, bucketLocalIdentifier),
        });

    describe("sanitizeMeasureFormat", () => {
        it("replaces the format with the new default when showInPercent flips on a catalog fact", () => {
            const state = stateWithCatalogFact();
            const previous = measure({
                attribute: catalogFact.fact.id,
                showInPercent: false,
                format: DEFAULT_DECIMAL_FORMAT,
            });
            const current = measure({
                attribute: catalogFact.fact.id,
                showInPercent: true,
                format: DEFAULT_DECIMAL_FORMAT,
            });

            expect(sanitizeMeasureFormat(previous, current, state)).toEqual({
                ...current,
                format: DEFAULT_PERCENTAGE_FORMAT,
            });
        });

        it("returns the measure untouched when showInPercent did not change", () => {
            const state = stateWithCatalogFact();
            const previous = measure({
                attribute: catalogFact.fact.id,
                showInPercent: true,
            });
            const current = measure({
                attribute: catalogFact.fact.id,
                showInPercent: true,
                format: "xxx",
            });

            // the same object, not merely an equal one - the format decision was skipped entirely
            expect(sanitizeMeasureFormat(previous, current, state)).toBe(current);
        });

        it("keeps a user format that was not the previous default", () => {
            const state = stateWithCatalogFact();
            const previous = measure({
                attribute: catalogFact.fact.id,
                showInPercent: false,
                format: "custom format",
            });
            const current = measure({
                attribute: catalogFact.fact.id,
                showInPercent: true,
                format: "custom format",
            });

            expect(sanitizeMeasureFormat(previous, current, state)).toBe(current);
        });

        it("uses the arithmetic operator defaults when the measure has no catalog item", () => {
            const state = getInitializedState();
            const previous = measure({
                attribute: "not.in.catalog",
                operator: ArithmeticOperatorType.RATIO,
                format: DEFAULT_DECIMAL_FORMAT,
            });
            const current = measure({
                attribute: "not.in.catalog",
                operator: ArithmeticOperatorType.CHANGE,
                format: DEFAULT_DECIMAL_FORMAT,
            });

            expect(sanitizeMeasureFormat(previous, current, state)).toEqual({
                ...current,
                format: DEFAULT_PERCENTAGE_FORMAT,
            });
        });

        it("returns the measure untouched when the arithmetic operator did not change", () => {
            const state = getInitializedState();
            const previous = measure({
                attribute: "not.in.catalog",
                operator: ArithmeticOperatorType.RATIO,
            });
            const current = measure({
                attribute: "not.in.catalog",
                operator: ArithmeticOperatorType.RATIO,
                format: "xxx",
            });

            expect(sanitizeMeasureFormat(previous, current, state)).toBe(current);
        });
    });

    describe("sanitizeFormats", () => {
        const referencePoint = (items: IBucketItem[]): IExtendedReferencePoint =>
            ({
                buckets: [{ localIdentifier: MEASURES, items }],
            }) as unknown as IExtendedReferencePoint;

        it("returns the reference point untouched when it carries no buckets", () => {
            const extendedReferencePoint = {} as IExtendedReferencePoint;

            expect(
                sanitizeFormats({} as IReferencePoint, extendedReferencePoint, getInitializedState()),
            ).toBe(extendedReferencePoint);
        });

        it("re-formats only the items that also exist in the previous reference point", () => {
            const state = stateWithCatalogFact();
            const previous = referencePoint([
                measure({
                    localIdentifier: "m1",
                    attribute: catalogFact.fact.id,
                    showInPercent: false,
                    format: DEFAULT_DECIMAL_FORMAT,
                }),
            ]) as unknown as IReferencePoint;
            const current = referencePoint([
                measure({
                    localIdentifier: "m1",
                    attribute: catalogFact.fact.id,
                    showInPercent: true,
                    format: DEFAULT_DECIMAL_FORMAT,
                }),
                measure({
                    localIdentifier: "m2",
                    attribute: catalogFact.fact.id,
                    showInPercent: true,
                    format: DEFAULT_DECIMAL_FORMAT,
                }),
            ]);

            const result = sanitizeFormats(previous, current, state);

            expect(result.buckets[0].items[0].format).toBe(DEFAULT_PERCENTAGE_FORMAT);
            // m2 has no previous counterpart, so its format is left exactly as it came in
            expect(result.buckets[0].items[1].format).toBe(DEFAULT_DECIMAL_FORMAT);
        });

        it("does not mutate the reference point it was given", () => {
            const state = stateWithCatalogFact();
            const previous = referencePoint([
                measure({
                    localIdentifier: "m1",
                    attribute: catalogFact.fact.id,
                    showInPercent: false,
                    format: DEFAULT_DECIMAL_FORMAT,
                }),
            ]) as unknown as IReferencePoint;
            const current = referencePoint([
                measure({
                    localIdentifier: "m1",
                    attribute: catalogFact.fact.id,
                    showInPercent: true,
                    format: DEFAULT_DECIMAL_FORMAT,
                }),
            ]);

            const result = sanitizeFormats(previous, current, state);

            expect(result).not.toBe(current);
            expect(current.buckets[0].items[0].format).toBe(DEFAULT_DECIMAL_FORMAT);
        });
    });

    describe("plain bucket queries", () => {
        const buckets = (): IRawBuckets => [
            {
                localIdentifier: MEASURES,
                items: [{ localIdentifier: "m1", type: METRIC }],
            },
            {
                localIdentifier: ATTRIBUTE,
                items: [{ localIdentifier: "a1", type: ATTRIBUTE }],
            },
        ];

        it("getBucketItemsInBuckets flattens the items of every bucket in order", () => {
            expect(getBucketItemsInBuckets(buckets()).map((item) => item.localIdentifier)).toEqual([
                "m1",
                "a1",
            ]);
        });

        it("getBucketItemsInBuckets tolerates a hole in the bucket list", () => {
            const withHole = [undefined, ...buckets()] as unknown as IRawBuckets;

            expect(getBucketItemsInBuckets(withHole).map((item) => item.localIdentifier)).toEqual([
                "m1",
                "a1",
            ]);
        });

        it("getMeasuresInBuckets keeps only metric items", () => {
            expect(getMeasuresInBuckets(buckets()).map((item) => item.localIdentifier)).toEqual(["m1"]);
        });
    });

    describe("areBucketsEmpty accepts both raw and decorated buckets", () => {
        it.each([
            ["raw, all buckets empty", [{ items: [] }, { items: [] }], true],
            ["raw, one bucket filled", [{ items: [] }, { items: [{ localIdentifier: "m1" }] }], false],
            ["plain, all buckets empty", [{ items: [] }, { items: [] }], true],
            ["plain, one bucket filled", [{ items: [] }, { items: [{ localIdentifier: "m1" }] }], false],
            ["plain container with an empty items list", [{ items: [] }], true],
            ["plain bucket with no items key at all", [{}], true],
        ])("answers %s with %s", (_name: string, value: IRawBuckets, expected: boolean) => {
            expect(areBucketsEmpty(value)).toBe(expected);
        });
    });

    describe("date bucket item predicates", () => {
        it("isDateBucketItem accepts both the date type and the date dataset attribute", () => {
            expect(isDateBucketItem({ type: "date" } as IRawBucketItem)).toBe(true);
            expect(
                isDateBucketItem({
                    attribute: DATE_DATASET_ATTRIBUTE,
                } as IRawBucketItem),
            ).toBe(true);
            expect(isDateBucketItem({ type: METRIC } as IRawBucketItem)).toBe(false);
        });

        it("hasBucketDateItem answers for the whole buckets subtree", () => {
            const withoutDate = withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                ],
            });
            const withDate = withData(withoutDate, {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                    {
                        localIdentifier: VIEW,
                        items: [{ localIdentifier: "d1", type: "date" }],
                    },
                ],
            });

            expect(hasBucketDateItem(withoutDate)).toBe(false);
            expect(hasBucketDateItem(withDate)).toBe(true);
        });
    });

    describe("isCategoriesOrStacks", () => {
        it.each([
            [VIEW, true],
            [ATTRIBUTE, true],
            [STACK, true],
            [COLUMNS, true],
            [MEASURES, false],
        ])("answers %s with %s", (localIdentifier: string, expected: boolean) => {
            expect(isCategoriesOrStacks(localIdentifier)).toBe(expected);
        });
    });

    describe("getMeasureVisualizationTypeName", () => {
        const stateWithVisualizationClass = (url: string): IAppState =>
            withData(getInitializedState(), {
                visualizationClass: visualizationClassMock(url),
            });

        it.each([
            ["local:bar", "bar"],
            ["local:combo2", "combo"],
            ["local:combo", "combo"],
            ["nonsense-without-a-colon", ""],
        ])("maps the %s visualization class url to '%s'", (url: string, expected: string) => {
            expect(getMeasureVisualizationTypeName(stateWithVisualizationClass(url))).toBe(expected);
        });

        it("answers an empty name when no visualization class is selected", () => {
            expect(getMeasureVisualizationTypeName(getInitializedState())).toBe("");
        });
    });

    describe("getAllDependantBucketItems", () => {
        const stateWithDependencyChain = (): IAppState =>
            withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [
                            { localIdentifier: "m1", type: METRIC },
                            {
                                localIdentifier: "m1_pop",
                                type: METRIC,
                                masterLocalIdentifier: "m1",
                            },
                            {
                                localIdentifier: "am1",
                                type: METRIC,
                                operandLocalIdentifiers: ["m1_pop", "m2"],
                            },
                            { localIdentifier: "m2", type: METRIC },
                        ],
                    },
                ],
            });

        it("walks the dependency chain transitively", () => {
            // m1 -> its derived m1_pop -> the arithmetic measure am1 built on m1_pop
            expect(getAllDependantBucketItems(stateWithDependencyChain(), "m1")).toEqual(["m1_pop", "am1"]);
        });

        it("returns the direct arithmetic dependants of an operand", () => {
            expect(getAllDependantBucketItems(stateWithDependencyChain(), "m2")).toEqual(["am1"]);
        });

        it("returns nothing for an unknown local identifier", () => {
            expect(getAllDependantBucketItems(stateWithDependencyChain(), "nope")).toEqual([]);
        });
    });

    describe("findInvalidArithmeticMeasuresForRemoval", () => {
        const stateWithMeasures = (measures: IRawBucketItems): IAppState =>
            withData(getInitializedState(), {
                buckets: [{ localIdentifier: MEASURES, items: measures }],
            });

        it("reports the invalid arithmetic measures when too few plain measures survive", () => {
            const state = stateWithMeasures([
                { localIdentifier: "m1", type: METRIC },
                { localIdentifier: "m2", type: METRIC },
                {
                    localIdentifier: "am1",
                    type: METRIC,
                    operandLocalIdentifiers: ["m1", null],
                },
            ]);

            expect(findInvalidArithmeticMeasuresForRemoval(state, "m1")).toEqual(["am1"]);
        });

        it("reports nothing while more than two plain measures survive the removal", () => {
            const state = stateWithMeasures([
                { localIdentifier: "m1", type: METRIC },
                { localIdentifier: "m2", type: METRIC },
                { localIdentifier: "m3", type: METRIC },
                { localIdentifier: "m4", type: METRIC },
                {
                    localIdentifier: "am1",
                    type: METRIC,
                    operandLocalIdentifiers: ["m1", null],
                },
            ]);

            expect(findInvalidArithmeticMeasuresForRemoval(state, "m1")).toEqual([]);
        });

        it("reports nothing when the removed bucket item is not a measure", () => {
            const state = withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [
                            { localIdentifier: "m1", type: METRIC },
                            {
                                localIdentifier: "am1",
                                type: METRIC,
                                operandLocalIdentifiers: ["m1", null],
                            },
                        ],
                    },
                    {
                        localIdentifier: ATTRIBUTE,
                        items: [{ localIdentifier: "a1", type: ATTRIBUTE }],
                    },
                ],
            });

            expect(findInvalidArithmeticMeasuresForRemoval(state, "a1")).toEqual([]);
        });
    });

    describe("totals reordering follows the enableNewPivotTable flag", () => {
        const stateWithTotals = (enableNewPivotTable: boolean): IAppState =>
            withData(withRoot(getInitializedState(), { featureFlags: { enableNewPivotTable } }), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [
                            { localIdentifier: "m1", type: METRIC },
                            { localIdentifier: "m2", type: METRIC },
                        ],
                    },
                    {
                        localIdentifier: ATTRIBUTE,
                        items: [{ localIdentifier: "a1", type: ATTRIBUTE }],
                        totals: [
                            {
                                measureIdentifier: "m2",
                                attributeIdentifier: "a1",
                                type: "sum",
                            },
                            {
                                measureIdentifier: "m1",
                                attributeIdentifier: "a1",
                                type: "sum",
                            },
                        ],
                    },
                ],
            });

        const rowTotals = (state: IAppState) => state.data.buckets?.[1]?.totals ?? [];

        it("reorders same-function totals by measure position when the flag is on", () => {
            const state = stateWithTotals(true);

            expect(rowTotals(sanitizeTotals(state, state))).toEqual([
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
                {
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
            ]);
        });

        it("keeps the stored total order when the flag is off", () => {
            const state = stateWithTotals(false);

            expect(rowTotals(sanitizeTotals(state, state))).toEqual([
                {
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
            ]);
        });
    });

    /**
     * Idempotence is never inherited: a deep-equal but freshly built collection is a NEW reference,
     * so value equality is not enough. The idempotence of these writes comes from the EXPLICIT
     * guards in the service (`bucketTotalsIdentical`, `buckets.equals(...)`), and where there is no
     * guard there is no idempotence. Both facts are pinned.
     */
    describe("idempotence of the buckets writes", () => {
        const stateWithBuckets = (): IAppState =>
            withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                    {
                        localIdentifier: ATTRIBUTE,
                        items: [{ localIdentifier: "a1", type: ATTRIBUTE }],
                        totals: [
                            {
                                measureIdentifier: "m1",
                                attributeIdentifier: "a1",
                                type: "sum",
                            },
                        ],
                    },
                ],
            });

        it("setBucketTotals returns the very same state when the totals are already stored", () => {
            const state = stateWithBuckets();
            const totals = state.data.buckets[1].totals as unknown as ITotal[];

            expect(setBucketTotals(state, totals, ATTRIBUTE)).toBe(state);
        });

        it("setBucketTotals returns the very same state for a deep-equal but distinct totals list", () => {
            const state = stateWithBuckets();
            const totals: ITotal[] = [
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
            ];

            expect(setBucketTotals(state, totals, ATTRIBUTE)).toBe(state);
        });

        it("sanitizeTotals rewrites an unchanged totals list to an equal but NEW state", () => {
            const state = stateWithBuckets();
            const result = sanitizeTotals(state, state);

            // no guard here, and the totals write short-circuits on the totals REFERENCE, not on
            // value equality - so the root changes even though nothing about the totals did
            expect(result).not.toBe(state);
            expect(result.data.buckets[1].totals).toEqual([
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
            ]);
        });

        it("sanitizeTotals returns the very same state when there are no totals at all", () => {
            const state = withData(getInitializedState(), {
                buckets: [
                    {
                        localIdentifier: MEASURES,
                        items: [{ localIdentifier: "m1", type: METRIC }],
                    },
                    {
                        localIdentifier: ATTRIBUTE,
                        items: [{ localIdentifier: "a1", type: ATTRIBUTE }],
                    },
                ],
            });

            expect(sanitizeTotals(state, state)).toBe(state);
        });

        it("mirrorTotalsToDerivedMeasures returns the very same state when there is nothing to mirror", () => {
            const state = stateWithBuckets();
            const master = {
                localIdentifier: "m1",
                type: METRIC,
            } as IRawBucketItem;

            // no derived measure of m1 exists, so no total gets duplicated
            expect(mirrorTotalsToDerivedMeasures(state, master)).toBe(state);
        });
    });
});
