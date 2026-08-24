// (C) 2024-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ResolvedDashboardConfig } from "../../types/commonTypes.js";

import { configReducers } from "./configReducers.js";
import { type ConfigState } from "./configState.js";

describe("configReducers", () => {
    describe("setIsAiGenerating", () => {
        it("should set isAiGenerating to true", () => {
            const initialState: ConfigState = {
                config: {
                    isAiGenerating: false,
                } as ResolvedDashboardConfig,
            };

            const action = { type: "config/setIsAiGenerating", payload: true };
            configReducers.setIsAiGenerating(initialState, action as any);

            expect(initialState.config?.isAiGenerating).toBe(true);
        });

        it("should set isAiGenerating to false", () => {
            const initialState: ConfigState = {
                config: {
                    isAiGenerating: true,
                } as ResolvedDashboardConfig,
            };

            const action = { type: "config/setIsAiGenerating", payload: false };
            configReducers.setIsAiGenerating(initialState, action as any);

            expect(initialState.config?.isAiGenerating).toBe(false);
        });

        it("should do nothing if config is not initialized", () => {
            const initialState: ConfigState = { config: undefined };

            const action = { type: "config/setIsAiGenerating", payload: true };
            configReducers.setIsAiGenerating(initialState, action as any);

            expect(initialState.config).toBeUndefined();
        });
    });

    describe("setIsAiMode", () => {
        it("should set isAiMode to true", () => {
            const initialState: ConfigState = {
                config: {
                    isAiMode: false,
                } as ResolvedDashboardConfig,
            };

            const action = { type: "config/setIsAiMode", payload: true };
            configReducers.setIsAiMode(initialState, action as any);

            expect(initialState.config?.isAiMode).toBe(true);
        });

        it("should set isAiMode to false", () => {
            const initialState: ConfigState = {
                config: {
                    isAiMode: true,
                } as ResolvedDashboardConfig,
            };

            const action = { type: "config/setIsAiMode", payload: false };
            configReducers.setIsAiMode(initialState, action as any);

            expect(initialState.config?.isAiMode).toBe(false);
        });

        it("should do nothing if config is not initialized", () => {
            const initialState: ConfigState = { config: undefined };

            const action = { type: "config/setIsAiMode", payload: true };
            configReducers.setIsAiMode(initialState, action as any);

            expect(initialState.config).toBeUndefined();
        });
    });
});
