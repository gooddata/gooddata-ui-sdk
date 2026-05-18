// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IParameterMetadataObject, idRef } from "@gooddata/sdk-model";

import {
    selectAdhocDateHierarchies,
    selectCatalogMeasureParameters,
    selectCatalogMeasureParametersStatus,
    selectCatalogParameters,
    selectCatalogParametersIsLoaded,
    selectCatalogParametersStatus,
} from "../catalogSelectors.js";
import { type ICatalogMeasureParametersState, type ICatalogParametersState } from "../catalogState.js";

import { catalogDateDatasets, defaultDateHierarchyTemplates } from "./catalogSelectors.fixture.js";

describe("catalogSelectors", () => {
    const createInitialState = (
        params: {
            supportsAttributeHierarchies?: boolean;
        } = {},
    ): any => {
        return {
            catalog: {
                dateHierarchyTemplates: defaultDateHierarchyTemplates,
                dateDatasets: catalogDateDatasets,
            },
            config: { config: {} },
            backendCapabilities: {
                backendCapabilities: {
                    supportsAttributeHierarchies: params?.supportsAttributeHierarchies ?? false,
                },
            },
        };
    };

    it("should return empty array if supportsAttributeHierarchies is off", () => {
        const initialState = createInitialState({
            supportsAttributeHierarchies: false,
        });
        expect(selectAdhocDateHierarchies(initialState)).toEqual([]);
    });

    it("should return adhoc date hierarchies", () => {
        const initialState = createInitialState({
            supportsAttributeHierarchies: true,
        });
        expect(selectAdhocDateHierarchies(initialState)).toMatchSnapshot();
    });

    describe("catalog parameters selectors", () => {
        const topN: IParameterMetadataObject = {
            type: "parameter",
            id: "topN",
            uri: "/topN",
            ref: idRef("topN", "parameter"),
            title: "Top N",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            definition: { type: "NUMBER", defaultValue: 10 },
        };

        const stateWith = (parameters: ICatalogParametersState): any => ({
            catalog: { parameters },
        });

        it("returns parameters list and status when loaded", () => {
            const state = stateWith({ status: "loaded", parameters: [topN] });
            expect(selectCatalogParameters(state)).toEqual([topN]);
            expect(selectCatalogParametersStatus(state)).toBe("loaded");
            expect(selectCatalogParametersIsLoaded(state)).toBe(true);
        });

        it("returns empty parameters when loading", () => {
            const state = stateWith({ status: "loading", parameters: [] });
            expect(selectCatalogParameters(state)).toEqual([]);
            expect(selectCatalogParametersIsLoaded(state)).toBe(false);
        });

        it("treats failed and gated-off as not loaded", () => {
            expect(selectCatalogParametersIsLoaded(stateWith({ status: "failed", parameters: [] }))).toBe(
                false,
            );
            expect(selectCatalogParametersIsLoaded(stateWith({ status: "gated-off", parameters: [] }))).toBe(
                false,
            );
        });
    });

    describe("catalog measure-parameter dependency selectors", () => {
        const stateWith = (measureParameters: ICatalogMeasureParametersState): any => ({
            catalog: { measureParameters },
        });

        it("returns map and status when loaded", () => {
            const map = { m1: [idRef("topN", "parameter")] };
            const state = stateWith({ status: "loaded", byMetric: map });
            expect(selectCatalogMeasureParameters(state)).toEqual(map);
            expect(selectCatalogMeasureParametersStatus(state)).toBe("loaded");
        });

        it("returns empty map and failed status", () => {
            const state = stateWith({ status: "failed", byMetric: {} });
            expect(selectCatalogMeasureParameters(state)).toEqual({});
            expect(selectCatalogMeasureParametersStatus(state)).toBe("failed");
        });

        it("returns uninitialized status by default", () => {
            const state = stateWith({ status: "uninitialized", byMetric: {} });
            expect(selectCatalogMeasureParametersStatus(state)).toBe("uninitialized");
        });
    });
});
