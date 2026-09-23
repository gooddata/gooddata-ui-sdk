// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogComputedAttribute,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import {
    selectAdhocDateHierarchies,
    selectCatalogAttributesWithComputed,
    selectCatalogFilterParameters,
    selectCatalogFilterParametersStatus,
    selectCatalogInsightParameters,
    selectCatalogInsightParametersStatus,
    selectCatalogParameters,
    selectCatalogParametersIsLoaded,
    selectCatalogParametersStatus,
    selectDrillableAttributeHierarchies,
} from "./catalogSelectors.js";
import { catalogDateDatasets, defaultDateHierarchyTemplates } from "./catalogSelectors.test.helpers.js";
import {
    type ICatalogFilterParametersState,
    type ICatalogInsightParametersState,
    type ICatalogParametersState,
} from "./catalogState.js";

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
        const stateWith = (insightParameters: ICatalogInsightParametersState): any => ({
            catalog: { insightParameters },
        });

        it("returns map and status when loaded", () => {
            const map = { m1: [idRef("topN", "parameter")] };
            const state = stateWith({ status: "loaded", byInsight: map });
            expect(selectCatalogInsightParameters(state)).toEqual(map);
            expect(selectCatalogInsightParametersStatus(state)).toBe("loaded");
        });

        it("returns empty map and failed status", () => {
            const state = stateWith({ status: "failed", byInsight: {} });
            expect(selectCatalogInsightParameters(state)).toEqual({});
            expect(selectCatalogInsightParametersStatus(state)).toBe("failed");
        });

        it("returns uninitialized status by default", () => {
            const state = stateWith({ status: "uninitialized", byInsight: {} });
            expect(selectCatalogInsightParametersStatus(state)).toBe("uninitialized");
        });
    });

    describe("catalog filter-parameter dependency selectors", () => {
        const stateWith = (filterParameters: ICatalogFilterParametersState): any => ({
            catalog: { filterParameters },
        });

        it("returns map and status when loaded", () => {
            const map = { m1: [idRef("topN", "parameter")] };
            const state = stateWith({ status: "loaded", byRef: map });
            expect(selectCatalogFilterParameters(state)).toEqual(map);
            expect(selectCatalogFilterParametersStatus(state)).toBe("loaded");
        });

        it("returns empty map and failed status", () => {
            const state = stateWith({ status: "failed", byRef: {} });
            expect(selectCatalogFilterParameters(state)).toEqual({});
            expect(selectCatalogFilterParametersStatus(state)).toBe("failed");
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

describe("drilling through restricted hierarchies", () => {
    const attributes = catalogDateDatasets[0].dateAttributes.slice(0, 3);
    const hierarchy: ICatalogAttributeHierarchy = {
        type: "attributeHierarchy",
        attributeHierarchy: {
            type: "attributeHierarchy",
            id: "hierarchy",
            uri: "/hierarchy",
            ref: idRef("hierarchy", "attributeHierarchy"),
            title: "Hierarchy",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            attributes: attributes.map(({ attribute }) => attribute.ref),
        },
    };

    it("allows a hierarchy whose complete path is readable", () => {
        expect(selectDrillableAttributeHierarchies.resultFunc([hierarchy], [], attributes, true)).toEqual([
            hierarchy,
        ]);
    });

    it.each([1, 2])("removes the whole hierarchy when level %s is unavailable", (level) => {
        const readable = attributes.filter((_, index) => index !== level);
        expect(selectDrillableAttributeHierarchies.resultFunc([hierarchy], [], readable, true)).toEqual([]);
    });

    it("does not remove other, fully readable hierarchies", () => {
        const readableHierarchy: ICatalogAttributeHierarchy = {
            ...hierarchy,
            attributeHierarchy: {
                ...hierarchy.attributeHierarchy,
                attributes: [attributes[0].attribute.ref, attributes[2].attribute.ref],
            },
        };
        expect(
            selectDrillableAttributeHierarchies.resultFunc(
                [hierarchy, readableHierarchy],
                [],
                [attributes[0], attributes[2]],
                true,
            ),
        ).toEqual([readableHierarchy]);
    });

    it("retains existing behavior with partial rendering disabled", () => {
        expect(
            selectDrillableAttributeHierarchies.resultFunc([hierarchy], [], [attributes[0]], false),
        ).toEqual([hierarchy]);
    });
});
