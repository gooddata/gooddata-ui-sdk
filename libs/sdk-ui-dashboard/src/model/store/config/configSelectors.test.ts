// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type DashboardConfig } from "../../types/commonTypes.js";
import { type DashboardState } from "../types.js";

import {
    selectAiReasoningTitle,
    selectIsAiBuilding,
    selectIsAiGenerating,
    selectIsAiLoading,
    selectIsAiMode,
    selectIsAiWaiting,
} from "./configSelectors.js";

function stateWithConfig(config: DashboardConfig): DashboardState {
    return { config: { config } } as DashboardState;
}

describe("AI mode config selectors", () => {
    it.each(["Exploring data", "", undefined])("should select the reasoning title %s", (aiReasoningTitle) => {
        expect(selectAiReasoningTitle(stateWithConfig({ aiReasoningTitle }))).toBe(aiReasoningTitle);
    });

    it("should return undefined when the reasoning title is omitted", () => {
        expect(selectAiReasoningTitle(stateWithConfig({}))).toBeUndefined();
    });

    it.each([
        {
            aiMode: undefined,
            enabled: false,
            generating: false,
            waiting: false,
            building: false,
            loading: false,
        },
        { aiMode: null, enabled: false, generating: false, waiting: false, building: false, loading: false },
        {
            aiMode: "active",
            enabled: true,
            generating: false,
            waiting: false,
            building: false,
            loading: false,
        },
        {
            aiMode: "generating",
            enabled: true,
            generating: true,
            waiting: false,
            building: false,
            loading: true,
        },
        {
            aiMode: "waiting",
            enabled: true,
            generating: false,
            waiting: true,
            building: false,
            loading: true,
        },
        {
            aiMode: "building",
            enabled: true,
            generating: false,
            waiting: false,
            building: true,
            loading: true,
        },
    ] as const)(
        "should derive AI behavior for $aiMode mode",
        ({ aiMode, enabled, generating, waiting, building, loading }) => {
            const state = stateWithConfig({ aiMode });

            expect(selectIsAiMode(state)).toBe(enabled);
            expect(selectIsAiGenerating(state)).toBe(generating);
            expect(selectIsAiWaiting(state)).toBe(waiting);
            expect(selectIsAiBuilding(state)).toBe(building);
            expect(selectIsAiLoading(state)).toBe(loading);
        },
    );

    it("should disable AI behavior when the mode is omitted", () => {
        const state = stateWithConfig({});

        expect(selectIsAiMode(state)).toBe(false);
        expect(selectIsAiGenerating(state)).toBe(false);
        expect(selectIsAiWaiting(state)).toBe(false);
        expect(selectIsAiBuilding(state)).toBe(false);
        expect(selectIsAiLoading(state)).toBe(false);
    });
});
