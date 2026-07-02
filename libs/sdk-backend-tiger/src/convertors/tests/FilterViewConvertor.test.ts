// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type AnalyticalDashboardModelV2,
    type JsonApiFilterViewOutWithLinks,
} from "@gooddata/api-client-tiger";
import { type IFilterContextDefinition, idRef } from "@gooddata/sdk-model";

import { convertFilterView } from "../fromBackend/FilterViewConvertor.js";
import { convertFilterViewContextToBackend } from "../toBackend/AnalyticalDashboardConverter.js";

const dashboardId = "dashboard-1";
const userId = "user-1";

function makeFilterViewResponse(
    content: AnalyticalDashboardModelV2.IFilterContextWithTab,
): JsonApiFilterViewOutWithLinks {
    return {
        id: "filter-view-1",
        type: "filterView",
        attributes: { title: "View 1", isDefault: false, content },
        relationships: {
            analyticalDashboard: { data: { id: dashboardId, type: "analyticalDashboard" } },
            user: { data: { id: userId, type: "user" } },
        },
    } as JsonApiFilterViewOutWithLinks;
}

describe("convertFilterView (fromBackend)", () => {
    it("surfaces parameters from filter view content when present", () => {
        const tigerRef = { identifier: { id: "topN", type: "parameter" } };
        const response = makeFilterViewResponse({
            version: "2",
            filters: [],
            tabLocalIdentifier: "tab-A",
            parameters: [
                {
                    ref: tigerRef as never,
                    parameterType: "NUMBER",
                    value: 25,
                    label: "Top N",
                    mode: "active",
                },
            ],
        });

        const filterView = convertFilterView(response);

        expect(filterView.parameters).toEqual([
            {
                ref: idRef("topN", "parameter"),
                parameterType: "NUMBER",
                value: 25,
                label: "Top N",
                mode: "active",
            },
        ]);
    });

    it("omits parameters when filter view content has none (backwards-compat)", () => {
        const response = makeFilterViewResponse({
            version: "2",
            filters: [],
            tabLocalIdentifier: "tab-A",
        });

        const filterView = convertFilterView(response);

        expect(filterView.parameters).toBeUndefined();
    });
});

describe("convertFilterViewContextToBackend", () => {
    const emptyFilterContext: IFilterContextDefinition = {
        title: "",
        description: "",
        filters: [],
    };

    it("emits parameters into filter view content when supplied", () => {
        const tigerRef = { identifier: { id: "topN", type: "parameter" } };

        const result = convertFilterViewContextToBackend(emptyFilterContext, "tab-A", [
            {
                ref: idRef("topN", "parameter"),
                parameterType: "NUMBER",
                value: 25,
                label: "Top N",
                mode: "active",
            },
        ]);

        expect(result.parameters).toEqual([
            {
                ref: tigerRef,
                parameterType: "NUMBER",
                value: 25,
                label: "Top N",
            },
        ]);
    });

    it("omits parameters when not supplied (backwards-compat)", () => {
        const result = convertFilterViewContextToBackend(emptyFilterContext, "tab-A");
        expect(result.parameters).toBeUndefined();
    });

    it("round-trips parameters through to-backend then from-backend", () => {
        const parameters = [
            {
                ref: idRef("topN", "parameter"),
                parameterType: "NUMBER" as const,
                value: 25,
                label: "Top N",
                mode: "active" as const,
            },
        ];

        const tigerContent = convertFilterViewContextToBackend(emptyFilterContext, "tab-A", parameters);
        const filterView = convertFilterView({
            id: "filter-view-1",
            type: "filterView",
            attributes: { title: "View 1", isDefault: false, content: tigerContent },
            relationships: {
                analyticalDashboard: { data: { id: "dashboard-1", type: "analyticalDashboard" } },
                user: { data: { id: "user-1", type: "user" } },
            },
        } as JsonApiFilterViewOutWithLinks);

        expect(filterView.parameters).toEqual(parameters);
    });
});
