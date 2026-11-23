// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IAttributeDescriptor,
    type IResultAttributeHeader,
    newAbsoluteDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { type IDrillEvent } from "@gooddata/sdk-ui";

import { createKdaDefinitionFromDrill, getKdaDrillCombinations, getKdaDrillableItems } from "./drilling.js";
import {
    attributeDescriptor,
    createDrillEvent,
    insight,
    measureDescriptor,
} from "./drilling.test.fixtures.js";

function createDefinition(event = createDrillEvent()) {
    const [comparison] = getKdaDrillCombinations(event);
    return createKdaDefinitionFromDrill({ catalogItems: [], locale: "en-US", comparison, event });
}

describe("getKdaDrillCombinations", () => {
    it("offers both neighboring comparisons and keeps the selected measure", () => {
        const comparisons = getKdaDrillCombinations(createDrillEvent());

        expect(comparisons.map((c) => c.where)).toEqual(["before", "after"]);
        expect(comparisons.map((c) => c.values)).toEqual([
            [10, 20],
            [20, 15],
        ]);
        expect(comparisons.every((c) => c.measure === measureDescriptor)).toBe(true);
    });

    it.each([
        [0, "after"],
        [2, "before"],
    ] as const)("offers only the available comparison at index %s", (index, where) => {
        expect(getKdaDrillCombinations(createDrillEvent(index)).map((c) => c.where)).toEqual([where]);
    });

    it("returns no comparisons without a date intersection", () => {
        const event = createDrillEvent();
        event.drillContext.intersection = [{ header: measureDescriptor }];
        expect(getKdaDrillCombinations(event)).toEqual([]);
    });

    it("returns no comparisons for unsupported granularities", () => {
        expect(getKdaDrillCombinations(createDrillEvent(1, "DAY_OF_WEEK"))).toEqual([]);
    });

    it("allows second granularities only when requested", () => {
        const event = createDrillEvent(1, "SECOND");
        expect(getKdaDrillCombinations(event)).toEqual([]);
        expect(getKdaDrillCombinations(event, true)).toHaveLength(2);
    });
});

describe("createKdaDefinitionFromDrill", () => {
    it("builds a definition with the selected dates and locale", () => {
        expect(createDefinition()).toMatchObject({
            metric: { measure: { localIdentifier: "revenue" } },
            dateAttribute: attributeDescriptor("date").attributeHeader.formOf,
            type: "previous_period",
            range: [
                { date: "2023-01-01", format: { locale: "en-US", pattern: "dd/MM/yyyy" } },
                { date: "2024-01-01", format: { locale: "en-US", pattern: "dd/MM/yyyy" } },
            ],
        });
    });

    it("uses the selected comparison rather than always using the first", () => {
        const event = createDrillEvent();
        const comparison = getKdaDrillCombinations(event)[1];
        const result = createKdaDefinitionFromDrill({ catalogItems: [], locale: "en-US", comparison, event });
        expect(result?.range.map((r) => r.date)).toEqual(["2024-01-01", "2025-01-01"]);
    });

    it("uses descriptor formatting and supports a year-to-year comparison", () => {
        const event = createDrillEvent();
        const comparison = getKdaDrillCombinations(event)[0];
        comparison.type = "year-to-year";
        comparison.range[0].descriptor.attributeHeader.format = { locale: "de-DE", pattern: "yyyy" };

        const result = createKdaDefinitionFromDrill({ catalogItems: [], locale: "en-US", comparison, event });
        expect(result?.type).toBe("same_period_previous_year");
        expect(result?.range[0].format).toEqual({ locale: "de-DE", pattern: "yyyy" });
    });

    it("returns undefined when the selected measure is not in the execution", () => {
        const event = createDrillEvent();
        const comparison = getKdaDrillCombinations(event)[0];
        const withoutMeasures = {
            ...event,
            dataView: { ...event.dataView, definition: { ...event.dataView.definition, measures: [] } },
        } as IDrillEvent;
        expect(
            createKdaDefinitionFromDrill({
                catalogItems: [],
                locale: "en-US",
                comparison,
                event: withoutMeasures,
            }),
        ).toBeUndefined();
    });

    it.each([0, 1])("returns undefined when normalized comparison date %s is missing", (index) => {
        const event = createDrillEvent();
        const comparison = getKdaDrillCombinations(event)[0];
        comparison.range[index].header.attributeHeaderItem.normalizedValue = undefined;
        expect(
            createKdaDefinitionFromDrill({ catalogItems: [], locale: "en-US", comparison, event }),
        ).toBeUndefined();
    });

    it("merges the clicked segment over matching filters and excludes date filters", () => {
        const event = createDrillEvent();
        const comparison = getKdaDrillCombinations(event)[0];
        const header = {
            ...attributeDescriptor("region"),
            attributeHeaderItem: { uri: "/East", name: "East" },
        };
        event.drillContext.intersection!.push({ header });
        const result = createKdaDefinitionFromDrill({
            catalogItems: [],
            locale: "en-US",
            comparison,
            event,
            filters: [
                newPositiveAttributeFilter(header.attributeHeader.ref, { uris: ["/West"] }),
                newNegativeAttributeFilter("product", { uris: ["/Excluded"] }),
                newAbsoluteDateFilter("date", "2022-01-01", "2026-01-01"),
            ],
        });

        expect(result?.filters).toHaveLength(2);
        expect(result?.filters?.[0]).toMatchObject({
            attributeFilter: {
                displayForm: header.attributeHeader.ref,
                attributeElements: { uris: ["/East"] },
                negativeSelection: false,
            },
        });
        expect(result?.filters?.[1]).toMatchObject({
            attributeFilter: {
                attributeElements: { uris: ["/Excluded"] },
                negativeSelection: true,
            },
        });
    });

    it("retains intersection-only filters, but not the date intersection", () => {
        const event = createDrillEvent();
        const regionHeader: IAttributeDescriptor & IResultAttributeHeader = {
            ...attributeDescriptor("region"),
            attributeHeaderItem: { uri: "/East", name: "East" },
        };
        event.drillContext.intersection!.push({ header: regionHeader });
        expect(createDefinition(event)?.filters).toHaveLength(1);
    });
});

describe("getKdaDrillableItems", () => {
    it("matches the insight's measures", () => {
        const [predicate] = getKdaDrillableItems(insight);
        expect(predicate(measureDescriptor, {} as never)).toBe(true);
        expect(predicate(attributeDescriptor("region"), {} as never)).toBe(false);
    });

    it("respects disabled measures and the enabled switch", () => {
        expect(getKdaDrillableItems(insight, false)).toEqual([]);
        expect(
            getKdaDrillableItems({
                insight: {
                    ...insight.insight,
                    properties: { controls: { disableKeyDriveAnalysisOn: { revenue: true } } },
                },
            }),
        ).toEqual([]);
    });
});
