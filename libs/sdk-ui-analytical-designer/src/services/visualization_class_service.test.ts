// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IVisualizationClass, type IVisualizationClassBody } from "@gooddata/sdk-model";

import { LOCAL_COLUMN, LOCAL_HEADLINE, LOCAL_TABLE } from "../constants/visualization_types.js";
import { initialState } from "../reducers/initial_state.js";
import { type IAppState } from "../store/types.js";
import { type IVisualizationClassesState } from "../store/visualization_classes/visualization_classes_state.js";
import { tableVisualizationClass } from "../tests/constants.test.helpers.js";
import { withData, withRoot } from "../tests/state_builder.test.helpers.js";

import {
    getEnabledVisualizationClasses,
    getEnabledVisualizationClassesUrls,
    getVisualizationClassType,
    isColumnSelected,
    isHeadlineSelected,
    isTableSelected,
    isVisualizationClassLocal,
    isVisualizationClassSupported,
} from "./visualization_class_service.js";

describe("visualization_class_service", () => {
    describe("getVisualizationClassType", () => {
        it("should return vis. type based on visualization class url", () => {
            const visClass = tableVisualizationClass;
            expect(getVisualizationClassType(visClass)).toEqual("table");
        });

        it("should return undefined for external visualization", () => {
            const visClass = {
                visualizationClass: {
                    url: "url/to/somewhere/index.js",
                },
            } as IVisualizationClass;

            expect(getVisualizationClassType(visClass)).toBeUndefined();
        });
    });

    describe("isVisualizationClassLocal", () => {
        it("should return true when visualization class url is in format local:xxx", () => {
            const visClass = {
                visualizationClass: {
                    url: "local:table",
                },
            } as IVisualizationClass;
            expect(isVisualizationClassLocal(visClass)).toBeTruthy();
        });

        it("should return false when visualization class url is not in format local:xxx", () => {
            const visClass = {
                visualizationClass: {
                    url: "url/to/somewhere/index.js",
                },
            } as IVisualizationClass;
            expect(isVisualizationClassLocal(visClass)).toBeFalsy();
        });
    });

    describe("isVisualizationClassSupported", () => {
        it("should be supported when visClass is on white-labelled list", () => {
            const visClass = {
                visualizationClass: {
                    url: "local:bar",
                },
            } as IVisualizationClass;

            expect(isVisualizationClassSupported(visClass)).toBeTruthy();
        });
    });

    describe("getEnabledVisualizationClasses", () => {
        it.each([
            ["bar", undefined],
            ["bar", undefined],
            ["bar", "aaa"],
            ["bar;pushpin", "aaa"],
        ])(
            "should return %s visClass when mapboxToken %s",
            (type: string, mapboxToken: string | undefined) => {
                const expectedVisClasses = type.split(";").map((t) => ({
                    visualizationClass: {
                        url: `local:${t}`,
                    },
                }));
                const state = withRoot(
                    withData(initialState, {
                        visualizationClasses: expectedVisClasses as unknown as IVisualizationClassesState,
                    }),
                    {
                        bootstrapData: {
                            ...withData(initialState, {
                                visualizationClasses:
                                    expectedVisClasses as unknown as IVisualizationClassesState,
                            }).bootstrapData,
                            mapboxToken,
                        },
                    },
                );

                expect(getEnabledVisualizationClasses(state)).toEqual(expectedVisClasses);
            },
        );
    });

    describe("getEnabledVisualizationClassesUrls", () => {
        const buildVisualizationClasses = () => [
            {
                visualizationClass: {
                    url: "local:bar",
                },
            },
            {
                visualizationClass: {
                    url: `local:geo`,
                },
            },
        ];

        it("should return urls of enabled visClasses", () => {
            const state = withData(initialState, {
                visualizationClasses: buildVisualizationClasses() as unknown as IVisualizationClassesState,
            });
            expect(getEnabledVisualizationClassesUrls(state)).toEqual(["local:bar"]);
        });
    });

    describe("accessibility mode and geo charts", () => {
        const geoVisClasses = [
            { visualizationClass: { url: "local:bar" } },
            { visualizationClass: { url: "local:pushpin" } },
            { visualizationClass: { url: "local:choropleth" } },
        ];

        function buildState(featureFlags: Record<string, boolean>, mapboxToken?: string) {
            return withRoot(
                withRoot(
                    withData(initialState, {
                        visualizationClasses: geoVisClasses as unknown as IVisualizationClassesState,
                    }),
                    {
                        bootstrapData: {
                            ...withData(initialState, {
                                visualizationClasses: geoVisClasses as unknown as IVisualizationClassesState,
                            }).bootstrapData,
                            mapboxToken,
                        },
                    },
                ),
                { featureFlags: featureFlags },
            );
        }

        it("should keep new geo charts available when accessibility mode is on", () => {
            const state = buildState({
                enableAccessibilityMode: true,
                enableNewGeoPushpin: true,
                enableGeoArea: true,
                enableGeoChartA11yImprovements: true,
            });

            expect(getEnabledVisualizationClassesUrls(state)).toEqual([
                "local:bar",
                "local:pushpin",
                "local:choropleth",
            ]);
        });

        it("should keep legacy mapbox pushpin hidden when accessibility mode is on", () => {
            const state = buildState(
                {
                    enableAccessibilityMode: true,
                    enableGeoArea: true,
                    enableGeoChartA11yImprovements: true,
                },
                "aaa",
            );

            expect(getEnabledVisualizationClassesUrls(state)).toEqual(["local:bar", "local:choropleth"]);
        });

        it("should hide choropleth only by its own flag, not by accessibility mode", () => {
            const state = buildState({
                enableAccessibilityMode: true,
                enableNewGeoPushpin: true,
                enableGeoChartA11yImprovements: true,
            });

            expect(getEnabledVisualizationClassesUrls(state)).toEqual(["local:bar", "local:pushpin"]);
        });

        it("should hide geo charts in accessibility mode when a11y improvements are disabled", () => {
            const state = buildState(
                {
                    enableAccessibilityMode: true,
                    enableNewGeoPushpin: true,
                    enableGeoArea: true,
                },
                "aaa",
            );

            expect(getEnabledVisualizationClassesUrls(state)).toEqual(["local:bar"]);
        });

        it("should not require a11y improvements outside accessibility mode", () => {
            const state = buildState({ enableNewGeoPushpin: true, enableGeoArea: true });

            expect(getEnabledVisualizationClassesUrls(state)).toEqual([
                "local:bar",
                "local:pushpin",
                "local:choropleth",
            ]);
        });
    });

    function setVisualizationClass(visClassUrl: string) {
        return withData(initialState, {
            visualizationClass: {
                visualizationClass: {
                    ...initialState.data.visualizationClass,
                    url: visClassUrl,
                } as unknown as IVisualizationClassBody,
            },
        });
    }

    describe("get visualization type", () => {
        it.each([
            ["isTableSelected", isTableSelected],
            ["isColumnSelected", isColumnSelected],
            ["isHeadlineSelected", isHeadlineSelected],
        ])(
            "%s should return false when visualization class is undefined",
            (_, func: (state: IAppState) => boolean) => {
                const state = withData(initialState, { visualizationClass: undefined });
                expect(func(state)).toBe(false);
            },
        );

        it.each([
            ["isTableSelected", isTableSelected],
            ["isColumnSelected", isColumnSelected],
            ["isHeadlineSelected", isHeadlineSelected],
        ])(
            "%s should return false when visualization class is empty object",
            (_, func: (state: IAppState) => boolean) => {
                const state = withData(initialState, {
                    visualizationClass: { ...initialState.data.visualizationClass },
                });
                expect(func(state)).toBe(false);
            },
        );

        describe("isTableSelected", () => {
            it("should return true when URL of current visualization class is local table URL", () => {
                const state = setVisualizationClass(LOCAL_TABLE);

                const isTable = isTableSelected(state);

                expect(isTable).toBe(true);
            });

            it("should return false when URL of current visualization class is not local table URL", () => {
                const state = setVisualizationClass(LOCAL_COLUMN);

                const isTable = isTableSelected(state);

                expect(isTable).toBe(false);
            });
        });

        describe("isColumnSelected", () => {
            it("should return true when URL of current visualization class is local column chart URL", () => {
                const state = setVisualizationClass(LOCAL_COLUMN);

                const isColumn = isColumnSelected(state);

                expect(isColumn).toBe(true);
            });

            it("should return false when URL of current visualization class is not local column chart URL", () => {
                const state = setVisualizationClass(LOCAL_TABLE);

                const isColumn = isColumnSelected(state);

                expect(isColumn).toBe(false);
            });
        });

        describe("isHeadlineSelected", () => {
            it("should return true when URL of current visualization class is local headline URL", () => {
                const state = setVisualizationClass(LOCAL_HEADLINE);

                const isHeadline = isHeadlineSelected(state);

                expect(isHeadline).toBe(true);
            });

            it("should return false when URL of current visualization class is not local headline URL", () => {
                const state = setVisualizationClass(LOCAL_TABLE);

                const isHeadline = isHeadlineSelected(state);

                expect(isHeadline).toBe(false);
            });
        });
    });
});
