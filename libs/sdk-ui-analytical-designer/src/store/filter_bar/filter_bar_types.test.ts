// (C) 2021-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { FilterBar, type IRankingFilter } from "./filter_bar_types.js";
import { type IParameterFilter, isParameterFilter } from "./parameter_filter_types.js";

describe("FilterBar", () => {
    describe("isParameterFilter", () => {
        const parameterFilter: IParameterFilter = {
            type: "parameter",
            localIdentifier: "local-1",
            parameterRef: idRef("threshold", "parameter"),
            name: "Threshold",
            value: 10,
            definition: { type: "NUMBER", defaultValue: 5 },
        };

        const rankingFilter: IRankingFilter = {
            type: "ranking",
            localIdentifier: "local-2",
            measureLocalIdentifier: "m1",
            operator: "TOP",
            value: 10,
        };

        it("should return true for parameter filters", () => {
            expect(isParameterFilter(parameterFilter)).toBe(true);
        });

        it("should return false for ranking filters", () => {
            expect(isParameterFilter(rankingFilter)).toBe(false);
        });
    });

    describe("isAttributeFilterSelectAll", () => {
        it("should return true when there is no selected element", () => {
            const result = FilterBar.isAttributeFilterSelectAll({
                selectedElements: [],
                isInverted: false,
                totalElementsCount: 0,
            });
            expect(result).toBe(true);
        });

        it("should return false if filter is not inverted and there are some selected elements", () => {
            const result = FilterBar.isAttributeFilterSelectAll({
                selectedElements: [
                    {
                        title: "element",
                        available: true,
                        uri: "/gdc/md/160?id=42",
                    },
                ],
                isInverted: false,
                totalElementsCount: 1,
            });
            expect(result).toBe(false);
        });

        it("should return false if filter is inverted and there are some selected elements not explicitly marked as not available", () => {
            const result = FilterBar.isAttributeFilterSelectAll({
                selectedElements: [
                    {
                        title: "element",
                        uri: "/gdc/md/160?id=42",
                    },
                ],
                isInverted: true,
                totalElementsCount: 1,
            });
            expect(result).toBe(false);
        });

        it("should return true if filter is inverted and there are some selected elements that are not available", () => {
            const result = FilterBar.isAttributeFilterSelectAll({
                selectedElements: [
                    {
                        title: "element",
                        available: false,
                        uri: "/gdc/md/160?id=42",
                    },
                ],
                isInverted: true,
                totalElementsCount: 1,
            });
            expect(result).toBe(true);
        });

        it("should return false if filter is inverted and there are some selected elements that are available", () => {
            const result = FilterBar.isAttributeFilterSelectAll({
                selectedElements: [
                    {
                        title: "element",
                        available: true,
                        uri: "/gdc/md/160?id=42",
                    },
                ],
                isInverted: true,
                totalElementsCount: 1,
            });
            expect(result).toBe(false);
        });
    });
});
