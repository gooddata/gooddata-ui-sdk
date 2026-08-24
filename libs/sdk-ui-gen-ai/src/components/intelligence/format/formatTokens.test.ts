// (C) 2026 GoodData Corporation

import { createIntl } from "react-intl";
import { describe, expect, it } from "vitest";

import { formatTokens } from "./formatTokens.js";

describe("formatTokens", () => {
    const intl = createIntl({
        locale: "en",
        messages: {
            "gd.gen-ai.interactionIntelligence.summary.tokens":
                "{count, plural, one {{formattedCount} token} other {{formattedCount} tokens}}",
        },
    });

    it("should render small counts as plain numbers", () => {
        expect(formatTokens(intl, 300)).toBe("300 tokens");
    });

    it("should use the singular form for a count of one", () => {
        expect(formatTokens(intl, 1)).toBe("1 token");
    });

    it("should compact thousands to a K suffix", () => {
        expect(formatTokens(intl, 4000)).toBe("4K tokens");
    });

    it("should compact millions to an M suffix", () => {
        expect(formatTokens(intl, 1200000)).toBe("1.2M tokens");
    });
});
