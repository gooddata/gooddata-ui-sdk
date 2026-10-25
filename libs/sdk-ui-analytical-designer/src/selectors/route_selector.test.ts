// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import {
    withPreviousRouteParams,
    withPreviousRouteQuery,
    withRouteParams,
    withRouteQuery,
} from "../tests/route.test.helpers.js";
import { withAppState } from "../tests/state_builder.test.helpers.js";
import { type ITagsConfiguration } from "../typings/route.js";

import {
    datasetParamChanged,
    getPreviousTagsConfiguration,
    getTagsConfiguration,
    isEmbeddedFromKD,
    isFullReloadNeeded,
    isLocationChangeLocked,
    isTagsConfigurationChanged,
} from "./route_selector.js";

describe("Route Selector", () => {
    describe("datasetParamChanged", () => {
        it("should return true if the previous dataset is different from the current one", () => {
            const state = withPreviousRouteQuery(
                withRouteQuery(initialState, { dataset: "currentDataset" }),
                { dataset: "previousDataset" },
            );

            expect(datasetParamChanged(state)).toEqual(true);
        });

        it("should return false if the previous dataset is the same as the current one", () => {
            const state = withPreviousRouteQuery(withRouteQuery(initialState, { dataset: "dataset" }), {
                dataset: "dataset",
            });

            expect(datasetParamChanged(state)).toEqual(false);
        });
    });

    describe("isLocationChangeLocked", () => {
        it("should be false by default", () => {
            expect(isLocationChangeLocked(initialState)).toBe(false);
        });

        it("should be true by default", () => {
            const state = withAppState(initialState, { locationRedirectLock: true });

            expect(isLocationChangeLocked(state)).toBe(true);
        });
    });

    describe("isFullReloadNeeded", () => {
        const PROJECT_ID_A = "project-id-A";
        const PROJECT_ID_B = "project-id-B";

        const mockState = withAppState(initialState, { appReady: true });

        it("should return true if project id is missing", () => {
            expect(isFullReloadNeeded(mockState)).toBe(true);
        });

        it("should return true if project id was changed", () => {
            const states = [
                withRouteParams(mockState, { projectId: PROJECT_ID_A }),

                withPreviousRouteParams(withRouteParams(mockState, { projectId: PROJECT_ID_A }), {
                    projectId: PROJECT_ID_B,
                }),
            ];

            states.forEach((state) => {
                expect(isFullReloadNeeded(state)).toBe(true);
            });
        });

        it("should return false if project id is the same", () => {
            const state = withPreviousRouteParams(withRouteParams(mockState, { projectId: PROJECT_ID_A }), {
                projectId: PROJECT_ID_A,
            });

            expect(isFullReloadNeeded(state)).toBe(false);
        });

        it("should return true if app is loading", () => {
            const state = withRouteParams(withAppState(mockState, { appReady: false }), {
                projectId: PROJECT_ID_A,
            });

            expect(isFullReloadNeeded(state)).toBe(true);
        });
    });

    describe("getTagsConfiguration", () => {
        it("should return empty object when tags configuration are not in state", () => {
            const tagsResult = getTagsConfiguration(initialState);
            expect(tagsResult).toEqual({
                includeObjectsWithTags: [],
                excludeObjectsWithTags: [],
            });
        });

        it("should return only include tags configuration from state", () => {
            const state = withRouteQuery(initialState, { includeObjectsWithTags: "[tag1,tag2]" });
            const tagsResult = getTagsConfiguration(state);

            const expectedTags: ITagsConfiguration = {
                excludeObjectsWithTags: [],
                includeObjectsWithTags: [{ identifier: "tag1" }, { identifier: "tag2" }],
            };
            expect(tagsResult).toEqual(expectedTags);
        });

        it("should return include & exclude tags configuration from state", () => {
            const state = withRouteQuery(initialState, {
                includeObjectsWithTags: "[tag1,tag2]",
                excludeObjectsWithTags: "[tag3]",
            });
            const tagsResult = getTagsConfiguration(state);

            const expectedTags: ITagsConfiguration = {
                includeObjectsWithTags: [{ identifier: "tag1" }, { identifier: "tag2" }],
                excludeObjectsWithTags: [{ identifier: "tag3" }],
            };
            expect(tagsResult).toEqual(expectedTags);
        });
    });

    describe("getPreviousTagsConfiguration", () => {
        it("should return empty object when tags configuration are not in state", () => {
            const tagsResult = getPreviousTagsConfiguration(initialState);
            expect(tagsResult).toEqual({
                includeObjectsWithTags: [],
                excludeObjectsWithTags: [],
            });
        });

        it("should return only include tags configuration from state", () => {
            const state = withPreviousRouteQuery(initialState, { includeObjectsWithTags: "[tag1,tag2]" });
            const tagsResult = getPreviousTagsConfiguration(state);

            const expectedTags: ITagsConfiguration = {
                excludeObjectsWithTags: [],
                includeObjectsWithTags: [{ identifier: "tag1" }, { identifier: "tag2" }],
            };
            expect(tagsResult).toEqual(expectedTags);
        });

        it("should return include & exclude tags configuration from state", () => {
            const state = withPreviousRouteQuery(initialState, {
                includeObjectsWithTags: "[tag1,tag2]",
                excludeObjectsWithTags: "[tag3]",
            });
            const tagsResult = getPreviousTagsConfiguration(state);

            const expectedTags: ITagsConfiguration = {
                includeObjectsWithTags: [{ identifier: "tag1" }, { identifier: "tag2" }],
                excludeObjectsWithTags: [{ identifier: "tag3" }],
            };
            expect(tagsResult).toEqual(expectedTags);
        });
    });

    describe("isTagsConfigurationChanged", () => {
        it("should return true when previous route tags are different from current route", () => {
            const state = withPreviousRouteQuery(
                withRouteQuery(initialState, { includeObjectsWithTags: "[tag1,tag2]" }),
                { includeObjectsWithTags: "[tag1,tag2]", excludeObjectsWithTags: "[tag3]" },
            );

            const result = isTagsConfigurationChanged(state);
            expect(result).toEqual(true);
        });

        it("should return false when previous and current route tags are same", () => {
            const state = withPreviousRouteQuery(
                withRouteQuery(initialState, {
                    includeObjectsWithTags: "[tag1,tag2]",
                    excludeObjectsWithTags: "[tag3]",
                }),
                { includeObjectsWithTags: "[tag1,tag2]", excludeObjectsWithTags: "[tag3]" },
            );

            const result = isTagsConfigurationChanged(state);
            expect(result).toEqual(false);
        });
    });

    describe("isEmbeddedFromKD", () => {
        it("should return false when the isEmbeddedFromKD param is false or undefined", () => {
            const state = withRouteQuery(initialState, { isEmbeddedFromKD: "false" });

            const result = isEmbeddedFromKD(state);
            expect(result).toEqual(false);
        });

        it("should return true when the isEmbeddedFromKD param is true", () => {
            const state = withRouteQuery(initialState, { isEmbeddedFromKD: "true" });

            const result = isEmbeddedFromKD(state);
            expect(result).toEqual(true);
        });
    });
});
