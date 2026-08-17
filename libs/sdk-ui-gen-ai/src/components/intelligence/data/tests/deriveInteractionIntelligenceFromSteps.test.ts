// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    IChatConversationApplyMemoryDetail,
    IChatConversationCatalogSearchDetail,
    IChatConversationSkillRoutingDetail,
} from "@gooddata/sdk-backend-spi";

import type { IChatConversationResponseTrace, IChatConversationTracedAction } from "../../../../types.js";
import { deriveInteractionIntelligenceFromSteps } from "../deriveInteractionIntelligenceFromSteps.js";

function catalogSearchDetail(overrides: Partial<IChatConversationCatalogSearchDetail> = {}) {
    return {
        category: "catalogSearch" as const,
        query: [],
        requestedTypes: [],
        found: [],
        used: [],
        ...overrides,
    };
}

function applyMemoryDetail(overrides: Partial<IChatConversationApplyMemoryDetail> = {}) {
    return {
        category: "applyMemory" as const,
        items: [{ title: "Prefers metric names", strategy: "always" as const }],
        ...overrides,
    };
}

function skillRoutingDetail(overrides: Partial<IChatConversationSkillRoutingDetail> = {}) {
    return {
        category: "skillRouting" as const,
        available: [],
        activated: [],
        ...overrides,
    };
}

function action(
    itemId: string,
    overrides: Partial<IChatConversationTracedAction> = {},
): IChatConversationTracedAction {
    return { itemId, createdAt: 0, ...overrides };
}

function trace(
    stepIds: string[],
    detailsByStepId: Record<string, IChatConversationTracedAction[]>,
    responseDetails: IChatConversationTracedAction[] = [],
): IChatConversationResponseTrace {
    return {
        responseDetails,
        steps: stepIds.map((stepId, i) => ({
            type: "interaction_step" as const,
            stepId,
            conversationId: "c",
            responseId: "r",
            stepIndex: i,
            durationMs: 100,
            tokens: { total: 10 },
            createdAt: i * 1000,
        })),
        detailsByStepId,
        traceId: undefined,
    };
}

describe("deriveInteractionIntelligenceFromSteps", () => {
    it("should yield one tile per step, keeping the step's own duration and tokens", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1", "s2"], {
                s1: [action("a1", { detail: skillRoutingDetail() })],
                s2: [action("a2", { detail: catalogSearchDetail() })],
            }),
        );

        expect(result.steps).toHaveLength(2);
        expect(result.steps[0]).toMatchObject({ stepId: "s1", index: 0, durationMs: 100, tokens: 10 });
        expect(result.steps[1]).toMatchObject({ stepId: "s2", index: 1, durationMs: 100, tokens: 10 });
    });

    it("should keep every category of a step that ran more than one, both pointing at that step's index", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1"], {
                s1: [
                    action("a1", { detail: skillRoutingDetail() }),
                    action("a2", { detail: catalogSearchDetail() }),
                ],
            }),
        );

        expect(result.steps[0].categories).toEqual(["skillRouting", "catalogSearch"]);
        expect(result.categories).toHaveLength(2);
        expect(result.categories.map((c) => c.category)).toEqual(["skillRouting", "catalogSearch"]);
        expect(result.categories[0].stepIndexes).toEqual([0]);
        expect(result.categories[1].stepIndexes).toEqual([0]);
    });

    it("should record every step index a category spans, as one row", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1", "s2", "s3"], {
                s1: [action("a1", { detail: skillRoutingDetail() })],
                s2: [],
                s3: [action("a2", { detail: skillRoutingDetail() })],
            }),
        );

        expect(result.categories).toHaveLength(1);
        expect(result.categories[0].stepIndexes).toEqual([0, 2]);
    });

    it("should not duplicate a step's index when a category runs more than once within it", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1"], {
                s1: [
                    action("a1", { detail: skillRoutingDetail() }),
                    action("a2", { detail: skillRoutingDetail() }),
                ],
            }),
        );

        expect(result.categories[0].stepIndexes).toEqual([0]);
    });

    it("should produce a tile with no categories and no row for a step whose actions carry no detail", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1"], {
                s1: [action("a1", { toolName: "some_tool" })],
            }),
        );

        expect(result.steps[0].categories).toEqual([]);
        expect(result.categories).toHaveLength(0);
        // The step's own time is not dropped even though it produced no category row.
        expect(result.steps[0].durationMs).toBe(100);
    });

    it("should merge detail rows across a category's occurrences", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1", "s2"], {
                s1: [action("a1", { detail: skillRoutingDetail({ activated: ["Skill A"] }) })],
                s2: [action("a2", { detail: skillRoutingDetail({ activated: ["Skill B"] }) })],
            }),
        );

        const activatedRow = result.categories[0].detailRows.find(
            (row) => row.labelId === "gd.gen-ai.interactionIntelligence.detail.activated",
        );
        expect(activatedRow?.value).toMatchObject({
            kind: "list",
            items: [{ label: "Skill A" }, { label: "Skill B" }],
        });
    });

    it("should sum excerpt counts across a category's occurrences instead of concatenating them", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1", "s2"], {
                s1: [
                    action("a1", {
                        detail: catalogSearchDetail({
                            found: [{ objectType: "metric", titles: ["m1", "m2"] }],
                        }),
                    }),
                ],
                s2: [
                    action("a2", {
                        detail: catalogSearchDetail({ found: [{ objectType: "metric", titles: ["m3"] }] }),
                    }),
                ],
            }),
        );

        expect(result.categories[0].excerpt?.fragments).toEqual([
            { id: "gd.gen-ai.interactionIntelligence.excerpt.found", values: { count: 3 } },
        ]);
    });

    it("should order categories by their earliest step", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1", "s2"], {
                s1: [action("a1", { detail: catalogSearchDetail() })],
                s2: [action("a2", { detail: skillRoutingDetail() })],
            }),
        );

        expect(result.categories.map((c) => c.category)).toEqual(["catalogSearch", "skillRouting"]);
    });

    it("should give a response-scoped detail a category row with no steps to highlight", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1"], { s1: [action("a1", { detail: skillRoutingDetail() })] }, [
                action("m1", { detail: applyMemoryDetail() }),
            ]),
        );

        expect(result.categories.map((c) => c.category)).toEqual(["applyMemory", "skillRouting"]);
        expect(result.categories[0].stepIndexes).toEqual([]);
        // The step it did not run in must not list it either.
        expect(result.steps[0].categories).toEqual(["skillRouting"]);
    });

    it("should keep a response-scoped category out of the step totals", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1"], {}, [action("m1", { detail: applyMemoryDetail() })]),
        );

        expect(result.totals).toEqual({ stepsCount: 1, durationMs: 100, tokens: 10 });
    });

    it("should compute totals from the raw step values, independent of category resolution", () => {
        const result = deriveInteractionIntelligenceFromSteps(
            "r",
            trace(["s1", "s2"], {
                s1: [action("a1", { toolName: "uncategorised_tool" })],
                s2: [action("a2", { detail: catalogSearchDetail() })],
            }),
        );

        expect(result.totals).toEqual({ stepsCount: 2, durationMs: 200, tokens: 20 });
    });
});
