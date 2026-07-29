// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IInsight, IInsightDefinition } from "@gooddata/sdk-model";

import { createCopiedInsight } from "../insightCopy.js";

const base: IInsightDefinition = {
    insight: {
        title: "Revenue by Region",
        summary: "Regional split",
        tags: ["finance"],
        visualizationUrl: "local:bar",
        buckets: [],
        filters: [],
        sorts: [],
        properties: { controls: { legend: { position: "top" } } },
    },
};

describe("createCopiedInsight", () => {
    it("appends a copy suffix to the title", () => {
        expect(createCopiedInsight(base).insight.title).toBe("Revenue by Region (2)");
    });

    it("increments an existing copy suffix", () => {
        const copy = createCopiedInsight({ insight: { ...base.insight, title: "Revenue by Region (2)" } });
        expect(copy.insight.title).toBe("Revenue by Region (3)");
    });

    it("preserves the author-owned definition body", () => {
        expect(createCopiedInsight(base).insight).toMatchObject({
            visualizationUrl: "local:bar",
            tags: ["finance"],
            summary: "Regional split",
            properties: { controls: { legend: { position: "top" } } },
        });
    });

    it("carries the source's visibility (author-owned, like the other content fields)", () => {
        const copy = createCopiedInsight({ insight: { ...base.insight, isHidden: true } });
        expect(copy.insight.isHidden).toBe(true);
    });

    it("drops a loaded insight's identity and audit fields so the copy is created fresh", () => {
        const loaded = {
            insight: {
                ...base.insight,
                identifier: "revenue.bar",
                uri: "/insights/revenue.bar",
                ref: { identifier: "revenue.bar", type: "insight" },
                created: "2024-01-01",
                updated: "2024-02-01",
                createdBy: { login: "a" },
                updatedBy: { login: "b" },
                isLocked: true,
            },
        } as unknown as IInsight;

        const { insight } = createCopiedInsight(loaded);

        for (const field of [
            "identifier",
            "uri",
            "ref",
            "created",
            "updated",
            "createdBy",
            "updatedBy",
            "isLocked",
        ]) {
            expect(insight).not.toHaveProperty(field);
        }
    });

    it("omits optional fields the source does not define", () => {
        const minimal: IInsightDefinition = {
            insight: {
                title: "Bare",
                visualizationUrl: "local:table",
                buckets: [],
                filters: [],
                sorts: [],
                properties: {},
            },
        };
        const { insight } = createCopiedInsight(minimal);
        expect(insight).not.toHaveProperty("tags");
        expect(insight).not.toHaveProperty("summary");
        expect(insight).not.toHaveProperty("layers");
    });
});
