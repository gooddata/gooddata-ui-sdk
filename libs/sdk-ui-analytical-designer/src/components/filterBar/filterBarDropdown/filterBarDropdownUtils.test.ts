// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef, localIdRef, objRefToString, serializeObjRef } from "@gooddata/sdk-model";
import { type IDimensionalityItem } from "@gooddata/sdk-ui-filters";

import { type IAttributeFilter } from "../../../store/filter_bar/filter_bar_types.js";
import { type ICacheItem } from "../../../typings/state_objects.js";

import {
    type RankingFilterDisabledReason,
    getAvailableInsightAttributeItems,
    getCacheItemByRef,
    getFilteredAttributeRefKeys,
    getRankingDisabledTooltipKey,
    getRankingFilterDisabledReason,
    isAttributeRefFiltered,
    toAttributeCacheItems,
} from "./filterBarDropdownUtils.js";

describe("filterBarDropdownUtils", () => {
    // The keys this Set holds are consumed by BOTH halves of the add-filter dropdown - the
    // insight-attributes section here and the catalog section in useCatalogItemPickerData /
    // useFilterBarPickerItems. They must all probe it with the SAME encoding, or the exclusion
    // silently becomes a no-op on one side and an already-filtered attribute stays listed.
    describe("getFilteredAttributeRefKeys", () => {
        const dfRef = idRef("label.owner.name", "displayForm");
        const itemCache = {
            "attribute.owner": {
                type: "attribute" as const,
                ref: idRef("owner", "attribute"),
                dfRef,
                title: "Owner",
                identifier: "owner",
                uri: "",
            },
        };
        const attributeFilter: IAttributeFilter = {
            type: "attribute",
            localIdentifier: "f1",
            cacheItemIdentifier: "owner",
            displayFormRef: dfRef,
            filterConfig: { selectedElements: [], totalElementsCount: 0, isInverted: true },
        };

        it("should key the excluded refs by their serialized form", () => {
            const keys = getFilteredAttributeRefKeys([attributeFilter], itemCache);

            expect(keys.has(serializeObjRef(dfRef))).toBe(true);
            // objRefToString drops the ref type, so probing with it can never hit
            expect(keys.has(objRefToString(dfRef))).toBe(false);
        });

        it("should exclude the filtered attribute from the catalog section", () => {
            const keys = getFilteredAttributeRefKeys([attributeFilter], itemCache);
            const catalogItems: IDimensionalityItem[] = [
                { identifier: dfRef, ref: dfRef, title: "Owner", type: "attribute" },
                {
                    identifier: idRef("label.region", "displayForm"),
                    ref: idRef("label.region", "displayForm"),
                    title: "Region",
                    type: "attribute",
                },
            ];

            // the SAME predicate the picker hooks use, so a drift there fails here
            const remaining = catalogItems.filter((item) => !isAttributeRefFiltered(keys, item.identifier));

            expect(remaining.map((i) => i.title)).toEqual(["Region"]);
        });

        it("should exclude the filtered attribute from the insight section too", () => {
            const keys = getFilteredAttributeRefKeys([attributeFilter], itemCache);
            const items = getAvailableInsightAttributeItems(
                [{ localIdentifier: "a1", type: "attribute", attribute: "owner", dfRef }],
                { a1: { name: "Owner", type: "attribute" } },
                keys,
            );

            expect(items).toEqual([]);
        });
    });

    describe("toAttributeCacheItems", () => {
        const mockDisplayFormRef = idRef("attr.country.displayForm");
        const mockCacheItem: ICacheItem = {
            type: "attribute",
            ref: idRef("attr.country"),
            dfRef: mockDisplayFormRef,
            title: "Country",
            identifier: "attr.country",
            uri: "/gdc/md/project/obj/123",
        };

        it("should return cached item when found in cacheItemByRef", () => {
            const cacheItemByRef = new Map<string, ICacheItem>([
                [serializeObjRef(mockDisplayFormRef), mockCacheItem],
            ]);

            const items: IDimensionalityItem[] = [
                {
                    identifier: mockDisplayFormRef,
                    ref: mockDisplayFormRef,
                    title: "Country",
                    type: "attribute",
                },
            ];

            const result = toAttributeCacheItems(items, cacheItemByRef);

            expect(result).toHaveLength(1);
            expect(result[0]).toBe(mockCacheItem);
        });

        it("should create fallback cache item when attribute is NOT in cache (catalog attribute)", () => {
            const catalogAttributeRef = idRef("attr.product.displayForm");
            const cacheItemByRef = new Map<string, ICacheItem>(); // Empty cache

            const items: IDimensionalityItem[] = [
                {
                    identifier: catalogAttributeRef,
                    ref: catalogAttributeRef,
                    title: "Product",
                    type: "attribute",
                },
            ];

            const result = toAttributeCacheItems(items, cacheItemByRef);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                type: "attribute",
                ref: catalogAttributeRef,
                dfRef: catalogAttributeRef,
                title: "Product",
                identifier: objRefToString(catalogAttributeRef),
                uri: "",
            });
        });

        it("should handle mixed items: some in cache, some not", () => {
            const catalogAttributeRef = idRef("attr.product.displayForm");
            const cacheItemByRef = new Map<string, ICacheItem>([
                [serializeObjRef(mockDisplayFormRef), mockCacheItem],
            ]);

            const items: IDimensionalityItem[] = [
                {
                    identifier: mockDisplayFormRef,
                    ref: mockDisplayFormRef,
                    title: "Country",
                    type: "attribute",
                },
                {
                    identifier: catalogAttributeRef,
                    ref: catalogAttributeRef,
                    title: "Product",
                    type: "attribute",
                },
            ];

            const result = toAttributeCacheItems(items, cacheItemByRef);

            expect(result).toHaveLength(2);
            // First item from cache
            expect(result[0]).toBe(mockCacheItem);
            // Second item created as fallback
            expect(result[1]).toEqual({
                type: "attribute",
                ref: catalogAttributeRef,
                dfRef: catalogAttributeRef,
                title: "Product",
                identifier: objRefToString(catalogAttributeRef),
                uri: "",
            });
        });

        it("should filter out items without ref (localIdRef identifiers with no ref)", () => {
            const cacheItemByRef = new Map<string, ICacheItem>();

            const items: IDimensionalityItem[] = [
                {
                    identifier: localIdRef("localId123"),
                    ref: undefined,
                    title: "Local Item",
                    type: "attribute",
                },
            ];

            const result = toAttributeCacheItems(items, cacheItemByRef);

            expect(result).toHaveLength(0);
        });

        it("should filter out metric type items", () => {
            const cacheItemByRef = new Map<string, ICacheItem>();

            const items = [
                {
                    identifier: "metric.revenue",
                    ref: idRef("metric.revenue"),
                    title: "Revenue",
                    type: "metric" as const,
                    uri: "/revenue",
                },
            ];

            const result = toAttributeCacheItems(items, cacheItemByRef);

            expect(result).toHaveLength(0);
        });

        it("should use identifier as ref if ref is not provided but identifier is ObjRef", () => {
            const attributeRef = idRef("attr.city.displayForm");
            const cacheItemByRef = new Map<string, ICacheItem>();

            const items: IDimensionalityItem[] = [
                {
                    identifier: attributeRef,
                    ref: undefined, // No ref provided
                    title: "City",
                    type: "attribute",
                },
            ];

            const result = toAttributeCacheItems(items, cacheItemByRef);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                type: "attribute",
                ref: attributeRef,
                dfRef: attributeRef,
                title: "City",
                identifier: objRefToString(attributeRef),
                uri: "",
            });
        });

        it("should handle empty items array", () => {
            const cacheItemByRef = new Map<string, ICacheItem>();

            const result = toAttributeCacheItems([], cacheItemByRef);

            expect(result).toHaveLength(0);
        });

        it("should keep attribute and computed attribute refs with the same identifier distinct", () => {
            const attributeItem = {
                ...mockCacheItem,
                dfRef: idRef("shared", "displayForm"),
            };
            const computedAttributeItem: ICacheItem = {
                ...mockCacheItem,
                type: "computedAttribute",
                ref: idRef("shared", "computedAttribute"),
                dfRef: idRef("shared", "computedAttribute"),
                title: "Computed shared",
            };
            const cacheItemByRef = getCacheItemByRef({
                "attribute.shared": attributeItem,
                "computedAttribute.shared": computedAttributeItem,
            });

            const [result] = toAttributeCacheItems(
                [
                    {
                        identifier: idRef("shared", "computedAttribute"),
                        ref: idRef("shared", "computedAttribute"),
                        title: "Computed shared",
                        type: "attribute",
                    },
                ],
                cacheItemByRef,
            );

            expect(result).toBe(computedAttributeItem);
            // and the other direction: the computed attribute must not have OVERWRITTEN the regular
            // attribute's map entries - its display form ref still resolves to the attribute
            expect(cacheItemByRef.get(serializeObjRef(idRef("shared", "displayForm")))).toBe(attributeItem);
        });
    });

    describe("getRankingFilterDisabledReason", () => {
        interface IDisabledReasonCase {
            scenario: string;
            supported: boolean;
            hasMeasures: boolean;
            hasAttributes: boolean;
            hasRankingFilter: boolean;
            hasActiveMvf: boolean;
            improvedRankingFilter?: boolean;
            rankingWithMvf?: boolean;
            expected: RankingFilterDisabledReason | undefined;
        }

        it.each<IDisabledReasonCase>([
            // base cases
            {
                scenario: "all conditions are met",
                supported: true,
                hasMeasures: true,
                hasAttributes: true,
                hasRankingFilter: false,
                hasActiveMvf: false,
                expected: undefined,
            },
            {
                scenario: "a ranking filter already exists",
                supported: true,
                hasMeasures: true,
                hasAttributes: true,
                hasRankingFilter: true,
                hasActiveMvf: false,
                expected: "existing",
            },
            {
                scenario: "the backend does not support ranking",
                supported: false,
                hasMeasures: true,
                hasAttributes: true,
                hasRankingFilter: false,
                hasActiveMvf: false,
                expected: "notSupported",
            },
            {
                scenario: "measures are missing",
                supported: true,
                hasMeasures: false,
                hasAttributes: true,
                hasRankingFilter: false,
                hasActiveMvf: false,
                expected: "missingItems",
            },
            {
                scenario: "attributes are missing",
                supported: true,
                hasMeasures: true,
                hasAttributes: false,
                hasRankingFilter: false,
                hasActiveMvf: false,
                expected: "missingItems",
            },
            {
                scenario: "an active measure value filter exists",
                supported: true,
                hasMeasures: true,
                hasAttributes: true,
                hasRankingFilter: false,
                hasActiveMvf: true,
                expected: "measureValueFilter",
            },
            // precedence
            {
                scenario: "'existing' wins over 'notSupported'",
                supported: false,
                hasMeasures: true,
                hasAttributes: true,
                hasRankingFilter: true,
                hasActiveMvf: true,
                expected: "existing",
            },
            {
                scenario: "'notSupported' wins over 'missingItems'",
                supported: false,
                hasMeasures: false,
                hasAttributes: false,
                hasRankingFilter: false,
                hasActiveMvf: true,
                expected: "notSupported",
            },
            {
                scenario: "'missingItems' wins over 'measureValueFilter'",
                supported: true,
                hasMeasures: false,
                hasAttributes: true,
                hasRankingFilter: false,
                hasActiveMvf: true,
                expected: "missingItems",
            },
            // enableImprovedRankingFilter
            {
                scenario: "improved on lifts the missing-measure blocker when attributes are present",
                supported: true,
                hasMeasures: false,
                hasAttributes: true,
                hasRankingFilter: false,
                hasActiveMvf: false,
                improvedRankingFilter: true,
                expected: undefined,
            },
            {
                scenario:
                    "improved on lifts the missing-attribute blocker (attributes can come from the catalog)",
                supported: true,
                hasMeasures: true,
                hasAttributes: false,
                hasRankingFilter: false,
                hasActiveMvf: false,
                improvedRankingFilter: true,
                expected: undefined,
            },
            {
                scenario: "improved on allows ranking with no insight measures or attributes",
                supported: true,
                hasMeasures: false,
                hasAttributes: false,
                hasRankingFilter: false,
                hasActiveMvf: false,
                improvedRankingFilter: true,
                expected: undefined,
            },
            {
                scenario: "improved on must not lift the MVF gate",
                supported: true,
                hasMeasures: false,
                hasAttributes: true,
                hasRankingFilter: false,
                hasActiveMvf: true,
                improvedRankingFilter: true,
                expected: "measureValueFilter",
            },
            // enableRankingWithMvf
            {
                scenario: "'measureValueFilter' is lifted only when enableRankingWithMvf is on",
                supported: true,
                hasMeasures: true,
                hasAttributes: true,
                hasRankingFilter: false,
                hasActiveMvf: true,
                rankingWithMvf: true,
                expected: undefined,
            },
            {
                scenario: "enableRankingWithMvf on must not lift the missing-items gate (improved off)",
                supported: true,
                hasMeasures: false,
                hasAttributes: true,
                hasRankingFilter: false,
                hasActiveMvf: true,
                rankingWithMvf: true,
                expected: "missingItems",
            },
        ])(
            "returns $expected when $scenario",
            ({
                supported,
                hasMeasures,
                hasAttributes,
                hasRankingFilter,
                hasActiveMvf,
                improvedRankingFilter,
                rankingWithMvf,
                expected,
            }) => {
                const result = getRankingFilterDisabledReason(
                    supported,
                    hasMeasures,
                    hasAttributes,
                    hasRankingFilter,
                    hasActiveMvf,
                    improvedRankingFilter,
                    rankingWithMvf,
                );
                expect(result).toBe(expected);
            },
        );
    });

    describe("getRankingDisabledTooltipKey", () => {
        it("should return undefined when reason is undefined", () => {
            expect(getRankingDisabledTooltipKey(undefined)).toBeUndefined();
        });

        it("should return correct key for 'existing' reason", () => {
            expect(getRankingDisabledTooltipKey("existing")).toBe(
                "filter_bar_dropdown.ranking_filter.item.disabled_existing.tooltip",
            );
        });

        it("should return correct key for 'notSupported' reason", () => {
            expect(getRankingDisabledTooltipKey("notSupported")).toBe(
                "filter_bar_dropdown.ranking_filter.item.disabled_not_supported.tooltip",
            );
        });

        it("should return correct key for 'missingItems' reason", () => {
            expect(getRankingDisabledTooltipKey("missingItems")).toBe(
                "filter_bar_dropdown.ranking_filter.item.disabled_missing_items.tooltip",
            );
        });

        it("should return correct key for 'measureValueFilter' reason", () => {
            expect(getRankingDisabledTooltipKey("measureValueFilter")).toBe(
                "filter_bar_dropdown.ranking_filter.item.disabled_with_measure_value_filter.tooltip",
            );
        });
    });
});
