// (C) 2019-2020 GoodData Corporation

import { idRef, IInsight, insightId, insightTitle, newInsightDefinition } from "@gooddata/sdk-model";
import { RecordedInsights } from "../insights";

/**
 * Creates test insight with the provided id and optionally with custom title. If title is not provided then one will be assigned.
 */
function testInsight(id: string, title?: string): IInsight {
    return {
        insight: {
            identifier: id,
            uri: "test",
            ...newInsightDefinition("local:test", (m) => m.title(title ?? "Untitled test insight")).insight,
        },
    };
}

describe("recorded insights", () => {
    it("should allow adding new insights", async () => {
        const insights = new RecordedInsights();
        const result = await insights.createInsight(
            newInsightDefinition("local:test", (m) => m.title("Test Insight 1")),
        );

        expect(insightId(result)).toBeDefined();
        expect(await insights.getInsight(idRef(insightId(result)))).toBeDefined();
    });

    let TestInsights: RecordedInsights = new RecordedInsights();
    beforeEach(() => {
        TestInsights = new RecordedInsights({
            metadata: {
                insights: {
                    i_123: { obj: testInsight("123", "title4") },
                    i_insight1: { obj: testInsight("insight1", "title3") },
                    i_insight2: { obj: testInsight("insight2", "title2") },
                    i_invalid: { obj: testInsight("insight4", "title1") },
                },
            },
        });
    });

    it("should allow retrieval of insights by ID", async () => {
        expect(await TestInsights.getInsight(idRef("123"))).toBeDefined();
    });

    it("expects insight id be part of the recording index", async () => {
        try {
            await TestInsights.getInsight(idRef("insight4"));
            fail("expected exception");
        } catch (e) {
            // expected
        }
    });

    it("should delete insight", async () => {
        await TestInsights.deleteInsight(idRef("123"));

        try {
            await TestInsights.getInsight(idRef("123"));
            fail("expected exception");
        } catch (e) {
            // expected
        }
    });

    it("should update insight", async () => {
        const insight = await TestInsights.getInsight(idRef("123"));
        insight.insight.title = "Test";

        const updated = await TestInsights.updateInsight(insight);

        expect(insightTitle(updated)).toEqual("Test");
    });

    it("should return clones of recordings", async () => {
        const insight = await TestInsights.getInsight(idRef("123"));
        insight.insight.title = "Test";
        const insightAgain = await TestInsights.getInsight(idRef("123"));

        expect(insightTitle(insightAgain)).not.toEqual(insightTitle(insight));
    });

    it("should return all insights", async () => {
        const page = await TestInsights.getInsights();

        expect(page.totalCount).toEqual(4);
    });

    it("should default to page size 50 when limit is not provided in options", async () => {
        const page = await TestInsights.getInsights();

        expect(page.limit).toEqual(50);
    });

    it("should return all insights ordered by ID", async () => {
        const page = await TestInsights.getInsights({ orderBy: "id" });

        expect(page.items.map(insightId)).toEqual(["123", "insight1", "insight2", "insight4"]);
    });

    it("should return all insights ordered by title", async () => {
        const page = await TestInsights.getInsights({ orderBy: "title" });

        expect(page.items.map(insightTitle)).toEqual(["title1", "title2", "title3", "title4"]);
    });
});
