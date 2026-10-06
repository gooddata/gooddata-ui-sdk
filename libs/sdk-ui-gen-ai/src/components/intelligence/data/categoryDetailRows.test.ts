// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { GenAIAnswerOutput, IChatConversationComposeAnswerDetail } from "@gooddata/sdk-backend-spi";

import { excerptForDetail } from "./categoryDetailRows.js";

const detail = (output: GenAIAnswerOutput): IChatConversationComposeAnswerDetail => ({
    category: "composeAnswer",
    output,
});

describe("excerptForDetail for a composed answer", () => {
    it.each([
        ["dashboard", "gd.gen-ai.interactionIntelligence.detail.output.dashboard"],
        ["report", "gd.gen-ai.interactionIntelligence.detail.output.report"],
    ] as const)("names a turn that produced a %s", (output, id) => {
        expect(excerptForDetail(detail(output))).toEqual([{ id }]);
    });
});
