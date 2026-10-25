// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { defaultRouteParams } from "../constants/route_params.js";
import { initialState } from "../reducers/initial_state.js";
import { withRouteParams, withRouteQuery } from "../tests/route.test.helpers.js";
import { withMeta } from "../tests/state_builder.test.helpers.js";

import { createRouteParams, getRouteUri } from "./location.js";

describe("location utils", () => {
    const projectId = "budtwmhq7k94vsd234dsf49j3620rzsm3u1";
    const datasetId = "csv.dataset.123";

    describe("getRouteUri", () => {
        it("should return a workspace-less hash built from params in state", () => {
            const state = withRouteParams(initialState, { projectId });

            expect(getRouteUri(state)).toEqual("#/reportId/edit");
        });

        it("should allow overriding uris", () => {
            const state = withRouteParams(initialState, { projectId });

            expect(getRouteUri(state, { reportId: "newReportId" })).toEqual("#/newReportId/edit");
        });

        it("should return the same uri when embedded", () => {
            const state = withRouteParams(withMeta(initialState, { isEmbedded: true }), { projectId });

            expect(getRouteUri(state)).toEqual("#/reportId/edit");
        });

        it("should attach query params", () => {
            const state = withRouteQuery(withRouteParams(initialState, { projectId }), {
                dataset: datasetId,
            });

            expect(getRouteUri(state)).toEqual(`#/reportId/edit?dataset=${datasetId}`);
        });
    });

    describe("createRouteParams", () => {
        it("should create router params base on default params", () => {
            const customRouteParams = {
                projectId: "foo",
                reportId: "bar",
                dataset: "test",
            };

            expect(createRouteParams(customRouteParams)).toEqual({
                ...defaultRouteParams,
                ...customRouteParams,
            });
        });

        it("should remove excludeObjectsWithTags if includeObjectsWithTags is existing", () => {
            const customRouteParams = {
                projectId: "foo",
                reportId: "bar",
                includeObjectsWithTags: "[a]",
                excludeObjectsWithTags: "[b]",
            };

            expect(createRouteParams(customRouteParams)).toEqual({
                ...defaultRouteParams,
                ...customRouteParams,
                excludeObjectsWithTags: null,
            });
        });
    });
});
