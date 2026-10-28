// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { LocalFeatureFlagOverrides, TigerFeatureDefinitions } from "../uiFeatures.js";

import { type FeatureDef, mapFeatures } from "./feature.js";

const feature = (type: FeatureDef["type"], value: unknown): FeatureDef => ({
    id: "test",
    key: "test",
    l: false,
    version: "1",
    type,
    value,
});

describe("feature mapping", () => {
    afterEach(() => {
        delete LocalFeatureFlagOverrides.enableRadarChart;
        delete LocalFeatureFlagOverrides.aiChatSearchLimit;
        delete LocalFeatureFlagOverrides.earlyAccessFeatures;
    });

    it("loads every registered flag without a separate mapping entry", () => {
        const inputs: Record<string, FeatureDef> = {};
        const expected: Record<string, unknown> = {};
        for (const [key, definition] of Object.entries(TigerFeatureDefinitions)) {
            const value =
                definition.type === "BOOLEAN"
                    ? !definition.defaultValue
                    : definition.type === "NUMBER"
                      ? 42
                      : { features: [] };
            inputs[key] = feature(
                definition.type,
                definition.type === "JSON" ? JSON.stringify(value) : value,
            );
            expected[key] = value;
        }
        expect(mapFeatures(inputs)).toEqual(expected);
    });

    it("ignores unknown, missing and invalid values without overriding defaults", () => {
        expect(
            mapFeatures({
                unknownFlag: feature("BOOLEAN", true),
                enableRadarChart: feature("STRING", "not-a-boolean"),
                enableMekkoChart: feature("BOOLEAN", undefined),
                aiChatSearchLimit: feature("STRING", "not-a-number"),
            }),
        ).toEqual({});
    });

    it("keeps static boolean conversion, numeric parsing and JSON decoding", () => {
        expect(
            mapFeatures({
                enableRadarChart: feature("STRING", "ENABLED"),
                enableMekkoChart: feature("STRING", "false"),
                aiChatSearchLimit: feature("STRING", "12.5"),
                earlyAccessFeatures: feature("JSON", '{"features":[]}'),
            }),
        ).toEqual({
            enableRadarChart: true,
            enableMekkoChart: false,
            aiChatSearchLimit: 12.5,
            earlyAccessFeatures: { features: [] },
        });
    });

    it("preserves malformed JSON failures for the caller's existing fallback", () => {
        expect(() => mapFeatures({ earlyAccessFeatures: feature("JSON", "invalid") })).toThrow(SyntaxError);
    });

    it.each([true, false])("uses the local boolean override %s instead of the remote value", (value) => {
        LocalFeatureFlagOverrides.enableRadarChart = value;
        expect(mapFeatures({ enableRadarChart: feature("BOOLEAN", !value) })).toEqual({
            enableRadarChart: value,
        });
    });

    it.each([0, undefined])("preserves the local numeric override %s", (value) => {
        LocalFeatureFlagOverrides.aiChatSearchLimit = value;
        expect(mapFeatures({ aiChatSearchLimit: feature("NUMBER", 42) })).toEqual({
            aiChatSearchLimit: value,
        });
    });

    it("does not decode an overridden remote flag", () => {
        LocalFeatureFlagOverrides.earlyAccessFeatures = { features: [] };
        expect(mapFeatures({ earlyAccessFeatures: feature("JSON", "invalid") })).toEqual({
            earlyAccessFeatures: { features: [] },
        });
    });
});
