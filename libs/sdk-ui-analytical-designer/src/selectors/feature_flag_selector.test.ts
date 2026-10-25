// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IUserSettings, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { initialState } from "../reducers/initial_state.js";
import { type IFeatureFlagsState } from "../store/feature_flags/feature_flags_state.js";
import { withRoot } from "../tests/state_builder.test.helpers.js";

import {
    enableGeoChartA11yImprovements,
    enableGeoChartsViewportConfig,
    enableGeoSegmentConflictRecommendation,
    enableImprovedRankingFilter,
    enableParameters,
    enableRankingWithMvf,
    enableStringParameters,
    getCatalogGroupsExpanded,
    getFeatureFlags,
    getPlatformEditionConfig,
    getUserId,
} from "./feature_flag_selector.js";

describe("FeatureFlagService", () => {
    describe("getAll", () => {
        it("should return list of feature flag", () => {
            const state = withRoot(initialState, {
                featureFlags: {
                    testFeatureFlag: false,
                    enableMetricDateFilter: true,
                },
            });

            expect(getFeatureFlags(state)).toEqual({
                testFeatureFlag: false,
                enableMetricDateFilter: true,
            });
        });

        it("should return empty object when feature flag list is empty", () => {
            // EMPTY, not absent: the branch always exists on the typed root (strict
            // combineReducers self-initializes it), so "no feature flags" is `{}`
            const state = withRoot(initialState, { featureFlags: {} });

            expect(getFeatureFlags(state)).toEqual({});
        });
    });

    describe("getFeatureFlagConfigs", () => {
        it("should return project config when user don't set user config", () => {
            const state = withRoot(initialState, {
                featureFlags: {
                    portalLogoPage: "/logo",
                },
            });

            expect(getFeatureFlags(state)).toEqual({
                portalLogoPage: "/logo",
            });
        });
    });

    it("should return platformEdition config", () => {
        const initState = withRoot(initialState, {
            featureFlags: {
                platformEdition: "free",
            },
        });
        const platformEdition = getPlatformEditionConfig(initState);
        expect(platformEdition).toBe("free");
    });

    describe("getCatalogGroupsExpanded", () => {
        it.each<[boolean, string, Partial<IUserWorkspaceSettings & IUserSettings>]>([
            [false, "undefined", {}],
            [true, "true", { ADCatalogGroupsExpanded: true }],
            [false, "false", { ADCatalogGroupsExpanded: false }],
        ])("should return %s when option is '%s'", (expectedResult, _description, config) => {
            const state = withRoot(initialState, {
                featureFlags: config,
            });
            expect(getCatalogGroupsExpanded(state)).toEqual(expectedResult);
        });
    });

    describe("enableRankingWithMvf", () => {
        it.each([
            [false, "undefined", {}],
            [true, "true", { enableRankingWithMvf: true }],
            [false, "false", { enableRankingWithMvf: false }],
        ])(
            "should return %s when option is '%s'",
            (expectedResult: boolean, _description: string, config: IFeatureFlagsState) => {
                const state = withRoot(initialState, { featureFlags: config });
                expect(enableRankingWithMvf(state)).toEqual(expectedResult);
            },
        );
    });

    describe("enableImprovedRankingFilter", () => {
        it.each([
            [true, "undefined", {}],
            [true, "true", { enableImprovedRankingFilter: true }],
            [false, "false", { enableImprovedRankingFilter: false }],
        ])(
            "should return %s when option is '%s'",
            (expectedResult: boolean, _description: string, config: IFeatureFlagsState) => {
                const state = withRoot(initialState, { featureFlags: config });
                expect(enableImprovedRankingFilter(state)).toEqual(expectedResult);
            },
        );
    });

    describe("enableParameters", () => {
        it.each([
            [false, "undefined", {}],
            [true, "true", { enableParameters: true }],
            [false, "false", { enableParameters: false }],
        ])(
            "should return %s when option is '%s'",
            (expectedResult: boolean, _description: string, config: IFeatureFlagsState) => {
                const state = withRoot(initialState, { featureFlags: config });
                expect(enableParameters(state)).toEqual(expectedResult);
            },
        );
    });

    describe("enableStringParameters", () => {
        it.each([
            [true, "undefined", {}],
            [true, "true", { enableStringParameters: true }],
            [false, "false", { enableStringParameters: false }],
        ])(
            "should return %s when option is '%s'",
            (expectedResult: boolean, _description: string, config: IFeatureFlagsState) => {
                const state = withRoot(initialState, { featureFlags: config });
                expect(enableStringParameters(state)).toEqual(expectedResult);
            },
        );
    });

    describe("enableGeoChartA11yImprovements", () => {
        it.each([
            [false, "undefined", {}],
            [true, "true", { enableGeoChartA11yImprovements: true }],
            [false, "false", { enableGeoChartA11yImprovements: false }],
        ])(
            "should return %s when option is '%s'",
            (expectedResult: boolean, _description: string, config: IFeatureFlagsState) => {
                const state = withRoot(initialState, { featureFlags: config });
                expect(enableGeoChartA11yImprovements(state)).toEqual(expectedResult);
            },
        );
    });

    describe("enableGeoChartsViewportConfig", () => {
        it.each([
            [true, "undefined", {}],
            [true, "true", { enableGeoChartsViewportConfig: true }],
            [false, "false", { enableGeoChartsViewportConfig: false }],
        ])(
            "should return %s when option is '%s'",
            (expectedResult: boolean, _description: string, config: Record<string, unknown>) => {
                const state = withRoot(initialState, {
                    featureFlags: config as unknown as Partial<IUserWorkspaceSettings & IUserSettings>,
                });
                expect(enableGeoChartsViewportConfig(state)).toEqual(expectedResult);
            },
        );
    });

    describe("enableGeoSegmentConflictRecommendation", () => {
        it.each([
            [false, "undefined", {}],
            [true, "true", { enableGeoSegmentConflictRecommendation: true }],
            [false, "false", { enableGeoSegmentConflictRecommendation: false }],
        ])(
            "should return %s when option is '%s'",
            (expectedResult: boolean, _description: string, config: Record<string, unknown>) => {
                const state = withRoot(initialState, {
                    featureFlags: config as unknown as Partial<IUserWorkspaceSettings & IUserSettings>,
                });
                expect(enableGeoSegmentConflictRecommendation(state)).toEqual(expectedResult);
            },
        );
    });

    describe("getUserId", () => {
        it("should return user identifier", () => {
            const state = withRoot(initialState, { featureFlags: { userId: "john-doe" } });
            expect(getUserId(state)).toBe("john-doe");
        });
    });
});
