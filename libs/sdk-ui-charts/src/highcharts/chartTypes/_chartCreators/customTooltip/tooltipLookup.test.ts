// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { buildKeySegment, joinKeySegments } from "@gooddata/sdk-ui-vis-commons";

import { buildPointKey } from "./tooltipLookup.js";

function attributeIntersection(args: {
    displayFormId: string;
    localIdentifier: string;
    uri: string;
}): IDrillEventIntersectionElement {
    return {
        header: {
            attributeHeader: {
                identifier: args.displayFormId,
                localIdentifier: args.localIdentifier,
            },
            attributeHeaderItem: { uri: args.uri, name: "" },
        },
    } as unknown as IDrillEventIntersectionElement;
}

function measureIntersection(localIdentifier: string): IDrillEventIntersectionElement {
    return {
        header: { measureHeaderItem: { localIdentifier } },
    } as unknown as IDrillEventIntersectionElement;
}

describe("buildPointKey — attributes sharing a display form id", () => {
    // An LDM identifier is unique only within an object type, so a label and a computed
    // attribute may share one. Keying by display form identifier put two segments with the
    // same identifier into one key, and since joinKeySegments sorts them, the attribute-to-value
    // pairing was lost: two rows with swapped values collapsed onto one key and the hovered
    // point resolved against the wrong row. A localIdentifier is unique within an execution.
    const row = (labelValue: string, computedValue: string) => [
        attributeIntersection({ displayFormId: "tier", localIdentifier: "a_label", uri: labelValue }),
        attributeIntersection({ displayFormId: "tier", localIdentifier: "a_ca", uri: computedValue }),
    ];

    it("keeps two rows apart when their values are swapped", () => {
        expect(buildPointKey(row("Gold", "Silver"))).not.toBe(buildPointKey(row("Silver", "Gold")));
    });

    it("still matches the same row built in the opposite order", () => {
        expect(buildPointKey(row("Gold", "Silver"))).toBe(buildPointKey(row("Gold", "Silver").reverse()));
    });
});

describe("buildPointKey", () => {
    it("returns empty key for empty intersection", () => {
        expect(buildPointKey([])).toBe("");
    });

    it("skips measure intersection elements", () => {
        const key = buildPointKey([
            measureIntersection("m_1"),
            attributeIntersection({
                displayFormId: "region.df",
                localIdentifier: "a_region",
                uri: "/region/east",
            }),
        ]);
        expect(key).toBe(buildKeySegment("a_region", "/region/east"));
    });

    it("keys the segment by the localIdentifier, never by the display form id", () => {
        const key = buildPointKey([
            attributeIntersection({
                displayFormId: "region.df",
                localIdentifier: "a_region",
                uri: "/region/east",
            }),
        ]);
        expect(key).toBe(buildKeySegment("a_region", "/region/east"));
        expect(key).not.toContain("region.df");
    });

    it("matches a lookup key built from the same segments in a different order", () => {
        // Mirrors the 2-view-by chart bug: chart-side intersection arrives in
        // child-before-parent order, while the tooltip execution dim 0 is in
        // parent-before-child order. With canonical sort in joinKeySegments,
        // both sides produce identical keys.
        const intersectionFromChart = [
            measureIntersection("m_1"),
            attributeIntersection({
                displayFormId: "child.df",
                localIdentifier: "a_child",
                uri: "/child/c1",
            }),
            attributeIntersection({
                displayFormId: "parent.df",
                localIdentifier: "a_parent",
                uri: "/parent/p1",
            }),
        ];
        const lookupSideKey = joinKeySegments([
            buildKeySegment("a_parent", "/parent/p1"),
            buildKeySegment("a_child", "/child/c1"),
        ]);

        expect(buildPointKey(intersectionFromChart)).toBe(lookupSideKey);
    });

    it("matches a lookup key for 2 view-by + stack-by combination", () => {
        const intersectionFromChart = [
            measureIntersection("m_1"),
            attributeIntersection({
                displayFormId: "child.df",
                localIdentifier: "a_child",
                uri: "/child/c1",
            }),
            attributeIntersection({
                displayFormId: "parent.df",
                localIdentifier: "a_parent",
                uri: "/parent/p1",
            }),
            attributeIntersection({
                displayFormId: "stack.df",
                localIdentifier: "a_stack",
                uri: "/stack/s1",
            }),
        ];
        const lookupSideKey = joinKeySegments([
            buildKeySegment("a_parent", "/parent/p1"),
            buildKeySegment("a_child", "/child/c1"),
            buildKeySegment("a_stack", "/stack/s1"),
        ]);

        expect(buildPointKey(intersectionFromChart)).toBe(lookupSideKey);
    });

    it("handles missing uri as empty string", () => {
        const key = buildPointKey([
            {
                header: {
                    attributeHeader: { identifier: "region.df", localIdentifier: "a_region" },
                    attributeHeaderItem: { name: "" },
                },
            } as unknown as IDrillEventIntersectionElement,
        ]);
        expect(key).toBe(buildKeySegment("a_region", ""));
    });
});
