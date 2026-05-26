// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { buildKeySegment, joinKeySegments } from "@gooddata/sdk-ui-vis-commons";

import { buildPointKey } from "../tooltipLookup.js";

function attributeIntersection(args: { displayFormId: string; uri: string }): IDrillEventIntersectionElement {
    return {
        header: {
            attributeHeader: { identifier: args.displayFormId },
            attributeHeaderItem: { uri: args.uri, name: "" },
        },
    } as unknown as IDrillEventIntersectionElement;
}

function measureIntersection(localIdentifier: string): IDrillEventIntersectionElement {
    return {
        header: { measureHeaderItem: { localIdentifier } },
    } as unknown as IDrillEventIntersectionElement;
}

describe("buildPointKey", () => {
    it("returns empty key for empty intersection", () => {
        expect(buildPointKey([])).toBe("");
    });

    it("skips measure intersection elements", () => {
        const key = buildPointKey([
            measureIntersection("m_1"),
            attributeIntersection({ displayFormId: "region.df", uri: "/region/east" }),
        ]);
        expect(key).toBe(buildKeySegment("region.df", "/region/east"));
    });

    it("matches a lookup key built from the same segments in a different order", () => {
        // Mirrors the 2-view-by chart bug: chart-side intersection arrives in
        // child-before-parent order, while the tooltip execution dim 0 is in
        // parent-before-child order. With canonical sort in joinKeySegments,
        // both sides produce identical keys.
        const intersectionFromChart = [
            measureIntersection("m_1"),
            attributeIntersection({ displayFormId: "child.df", uri: "/child/c1" }),
            attributeIntersection({ displayFormId: "parent.df", uri: "/parent/p1" }),
        ];
        const lookupSideKey = joinKeySegments([
            buildKeySegment("parent.df", "/parent/p1"),
            buildKeySegment("child.df", "/child/c1"),
        ]);

        expect(buildPointKey(intersectionFromChart)).toBe(lookupSideKey);
    });

    it("matches a lookup key for 2 view-by + stack-by combination", () => {
        const intersectionFromChart = [
            measureIntersection("m_1"),
            attributeIntersection({ displayFormId: "child.df", uri: "/child/c1" }),
            attributeIntersection({ displayFormId: "parent.df", uri: "/parent/p1" }),
            attributeIntersection({ displayFormId: "stack.df", uri: "/stack/s1" }),
        ];
        const lookupSideKey = joinKeySegments([
            buildKeySegment("parent.df", "/parent/p1"),
            buildKeySegment("child.df", "/child/c1"),
            buildKeySegment("stack.df", "/stack/s1"),
        ]);

        expect(buildPointKey(intersectionFromChart)).toBe(lookupSideKey);
    });

    it("handles missing uri as empty string", () => {
        const key = buildPointKey([
            {
                header: {
                    attributeHeader: { identifier: "df" },
                    attributeHeaderItem: { name: "" },
                },
            } as unknown as IDrillEventIntersectionElement,
        ]);
        expect(key).toBe(buildKeySegment("df", ""));
    });
});
