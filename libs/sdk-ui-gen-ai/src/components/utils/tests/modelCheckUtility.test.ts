// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isSupportedOpenAiModel } from "../modelCheckUtility.js";

describe("isSupportedOpenAiModel", () => {
    it.each(["gpt-5.2", "gpt-5.2-mini", "gpt-5.3", "gpt-6", "GPT-5.2"])(
        "returns true for supported model %s",
        (modelId) => {
            expect(isSupportedOpenAiModel(modelId)).toEqual({ isSupported: true, isOpenAi: true });
        },
    );

    it.each([
        [undefined, { isSupported: false, isOpenAi: false }],
        ["", { isSupported: false, isOpenAi: false }],
        ["gpt-5", { isSupported: false, isOpenAi: true }],
        ["gpt-5.1", { isSupported: false, isOpenAi: true }],
        ["gpt-4o", { isSupported: false, isOpenAi: true }],
        ["gpt-4.1", { isSupported: false, isOpenAi: true }],
        ["o1-mini", { isSupported: false, isOpenAi: true }],
        ["o3-mini", { isSupported: false, isOpenAi: true }],
        ["o4-mini", { isSupported: false, isOpenAi: true }],
    ])("returns false for unsupported model %s", (modelId, res) => {
        expect(isSupportedOpenAiModel(modelId)).toEqual(res);
    });
});
