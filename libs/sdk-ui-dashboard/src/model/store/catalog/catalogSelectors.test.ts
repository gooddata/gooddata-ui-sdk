// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogComputedAttribute,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import {
    selectAdhocDateHierarchies,
    selectCatalogAttributesWithComputed,
    selectCatalogMeasureParameters,
    selectCatalogMeasureParametersStatus,
    selectCatalogParameters,
    selectCatalogParametersIsLoaded,
    selectCatalogParametersStatus,
} from "./catalogSelectors.js";
import { catalogDateDatasets, defaultDateHierarchyTemplates } from "./catalogSelectors.test.helpers.js";
import { type ICatalogMeasureParametersState, type ICatalogParametersState } from "./catalogState.js";

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

    describe("selectCatalogAttributesWithComputed", () => {
        const displayForm = (id: string, type: "displayForm" | "computedAttribute", attributeId: string) =>
            ({
                type: "displayForm",
                ref: idRef(id, type),
                id,
                uri: id,
                title: id,
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                attribute: idRef(attributeId, type === "displayForm" ? "attribute" : "computedAttribute"),
            }) satisfies IAttributeDisplayFormMetadataObject;
        const attribute = (id: string, title: string): ICatalogAttribute => ({
            type: "attribute",
            attribute: {
                type: "attribute",
                ref: idRef(id, "attribute"),
                id,
                uri: id,
                title,
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                displayForms: [displayForm(`${id}.label`, "displayForm", id)],
            },
            defaultDisplayForm: displayForm(`${id}.label`, "displayForm", id),
            displayForms: [displayForm(`${id}.label`, "displayForm", id)],
            geoPinDisplayForms: [],
            groups: [],
        });
        const computedAttribute = (id: string, title: string): ICatalogComputedAttribute => ({
            type: "computedAttribute",
            computedAttribute: {
                type: "computedAttribute",
                ref: idRef(id, "computedAttribute"),
                id,
                uri: id,
                title,
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                expression: "SELECT 1",
                displayForms: [displayForm(id, "computedAttribute", id)],
            },
            defaultDisplayForm: displayForm(id, "computedAttribute", id),
            displayForms: [displayForm(id, "computedAttribute", id)],
            groups: [],
        });
        const stateWith = (
            attributes: ICatalogAttribute[],
            computedAttributes: ICatalogComputedAttribute[],
        ): any => ({
            catalog: { attributes, computedAttributes },
            config: { config: {} },
        });

        it("returns the plain attributes array untouched when there are no computed attributes", () => {
            const attributes = [attribute("account", "Account")];
            const state = stateWith(attributes, []);
            expect(selectCatalogAttributesWithComputed(state)).toBe(attributes);
        });

        it("interleaves computed attributes into one title-sorted list", () => {
            const state = stateWith(
                [attribute("account", "Account"), attribute("zebra", "Zebra")],
                [computedAttribute("ca_1", "bucketed accounts")],
            );

            expect(selectCatalogAttributesWithComputed(state).map((item) => item.attribute.title)).toEqual([
                "Account",
                "bucketed accounts",
                "Zebra",
            ]);
        });
    });
});
