// (C) 2024-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ResolvedDashboardConfig } from "../../types/commonTypes.js";

import { configReducers } from "./configReducers.js";
import { type ConfigState } from "./configState.js";

describe("configReducers", () => {
    describe("setConfig", () => {
        it("should replace the resolved config", () => {
            const initialState: ConfigState = {
                config: { aiMode: "building", locale: "en-US" } as ResolvedDashboardConfig,
            };
            const config = { aiMode: "active", locale: "fr-FR" } as ResolvedDashboardConfig;

            configReducers.setConfig(initialState, { type: "config/setConfig", payload: config });

            expect(initialState.config).toEqual(config);
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
