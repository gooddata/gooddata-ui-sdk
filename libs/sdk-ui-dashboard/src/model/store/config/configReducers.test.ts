// (C) 2024-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ResolvedDashboardConfig } from "../../types/commonTypes.js";

import { configReducers } from "./configReducers.js";
import { type ConfigState } from "./configState.js";

describe("configReducers", () => {
    describe("setAiReasoningTitle", () => {
        it.each(["Choosing charts", "", undefined])(
            "should replace or clear the title with %s",
            (aiReasoningTitle) => {
                const initialState: ConfigState = {
                    config: {
                        aiMode: "building",
                        aiReasoningTitle: "Exploring data",
                        locale: "en-US",
                    } as ResolvedDashboardConfig,
                };

                configReducers.setAiReasoningTitle(initialState, {
                    type: "config/setAiReasoningTitle",
                    payload: aiReasoningTitle,
                });

                expect(initialState.config).toEqual({
                    aiMode: "building",
                    aiReasoningTitle,
                    locale: "en-US",
                });
            },
        );

        it("should do nothing if config is not initialized", () => {
            const initialState: ConfigState = { config: undefined };

            configReducers.setAiReasoningTitle(initialState, {
                type: "config/setAiReasoningTitle",
                payload: "Exploring data",
            });

            expect(initialState.config).toBeUndefined();
        });
    });

    describe("setAiMode", () => {
        it.each(["active", "generating", "waiting", "building", null, undefined] as const)(
            "should replace the AI mode with %s",
            (aiMode) => {
                const initialState: ConfigState = {
                    config: {
                        aiMode: "building",
                        locale: "en-US",
                    } as ResolvedDashboardConfig,
                };

                configReducers.setAiMode(initialState, { type: "config/setAiMode", payload: aiMode });

                expect(initialState.config).toEqual({ aiMode, locale: "en-US" });
            },
        );

        it("should do nothing if config is not initialized", () => {
            const initialState: ConfigState = { config: undefined };

            configReducers.setAiMode(initialState, { type: "config/setAiMode", payload: "active" });

            expect(initialState.config).toBeUndefined();
        });
    });
});
