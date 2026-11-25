// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogComputedAttribute,
    type IDateRangeParameterMetadataObject,
    type IScalarParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import {
    selectAdhocDateHierarchies,
    selectCatalogAttributesWithComputed,
    selectCatalogDateRangeParameterByRef,
    selectCatalogDateRangeParameterTitle,
    selectCatalogDateRangeParameters,
    selectCatalogDateRangeParametersStatus,
    selectCatalogParameterDependencies,
    selectCatalogParameterDependenciesStatus,
    selectCatalogParameters,
    selectCatalogParametersIsLoaded,
    selectCatalogParametersStatus,
    selectDrillableAttributeHierarchies,
} from "./catalogSelectors.js";
import { catalogDateDatasets, defaultDateHierarchyTemplates } from "./catalogSelectors.test.helpers.js";
import { type ICatalogParameterDependenciesState, type ICatalogParametersState } from "./catalogState.js";

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
        const topN: IScalarParameterMetadataObject = {
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
        const lastHoldingMonth: IDateRangeParameterMetadataObject = {
            ...topN,
            id: "lastHoldingMonth",
            uri: "/lastHoldingMonth",
            ref: idRef("lastHoldingMonth", "parameter"),
            title: "Last holding month",
            definition: {
                type: "DATE_RANGE",
                defaultValue: { granularity: "GDC.time.month", from: "2025-08" },
            },
        };
        const untitledPeriod: IDateRangeParameterMetadataObject = {
            ...lastHoldingMonth,
            id: "untitledPeriod",
            uri: "/untitledPeriod",
            ref: idRef("untitledPeriod", "parameter"),
            title: "",
        };

        const stateWith = (parameters: ICatalogParametersState): any => ({
            catalog: { parameters },
        });
        const loadedState = stateWith({
            status: "loaded",
            parameters: [topN],
            dateRangeParametersStatus: "loaded",
            dateRangeParameters: [lastHoldingMonth, untitledPeriod],
        });

        it("returns parameters list and status when loaded", () => {
            const state = stateWith({
                status: "loaded",
                parameters: [topN],
                dateRangeParametersStatus: "gated-off",
                dateRangeParameters: [],
            });
            expect(selectCatalogParameters(state)).toEqual([topN]);
            expect(selectCatalogParametersStatus(state)).toBe("loaded");
            expect(selectCatalogParametersIsLoaded(state)).toBe(true);
        });

        it("returns empty parameters when loading", () => {
            const state = stateWith({
                status: "loading",
                parameters: [],
                dateRangeParametersStatus: "loading",
                dateRangeParameters: [],
            });
            expect(selectCatalogParameters(state)).toEqual([]);
            expect(selectCatalogDateRangeParameters(state)).toEqual([]);
            expect(selectCatalogParametersIsLoaded(state)).toBe(false);
        });

        it("treats failed and gated-off as not loaded", () => {
            expect(
                selectCatalogParametersIsLoaded(
                    stateWith({
                        status: "failed",
                        parameters: [],
                        dateRangeParametersStatus: "failed",
                        dateRangeParameters: [],
                    }),
                ),
            ).toBe(false);
            expect(
                selectCatalogParametersIsLoaded(
                    stateWith({
                        status: "gated-off",
                        parameters: [],
                        dateRangeParametersStatus: "gated-off",
                        dateRangeParameters: [],
                    }),
                ),
            ).toBe(false);
        });

        it("returns the date range parameters status apart from the scalar status", () => {
            const state = stateWith({
                status: "gated-off",
                parameters: [],
                dateRangeParametersStatus: "loaded",
                dateRangeParameters: [lastHoldingMonth],
            });
            expect(selectCatalogDateRangeParametersStatus(state)).toBe("loaded");
            expect(selectCatalogDateRangeParameters(state)).toEqual([lastHoldingMonth]);
            expect(selectCatalogParametersStatus(state)).toBe("gated-off");
            expect(selectCatalogParametersIsLoaded(state)).toBe(false);
        });

        it("returns the date range parameters apart from the scalar parameters", () => {
            expect(selectCatalogDateRangeParameters(loadedState)).toEqual([lastHoldingMonth, untitledPeriod]);
            expect(selectCatalogParameters(loadedState)).toEqual([topN]);
        });

        it("finds a date range parameter by a typed and by an untyped ref", () => {
            expect(
                selectCatalogDateRangeParameterByRef(idRef("lastHoldingMonth", "parameter"))(loadedState),
            ).toBe(lastHoldingMonth);
            expect(selectCatalogDateRangeParameterByRef(idRef("lastHoldingMonth"))(loadedState)).toBe(
                lastHoldingMonth,
            );
        });

        it("finds no date range parameter for an unknown ref or a scalar parameter's ref", () => {
            expect(selectCatalogDateRangeParameterByRef(idRef("deleted", "parameter"))(loadedState)).toBe(
                undefined,
            );
            expect(selectCatalogDateRangeParameterByRef(topN.ref)(loadedState)).toBe(undefined);
        });

        it("returns the date range parameter's title, falling back to its id and then to the ref's identifier", () => {
            expect(selectCatalogDateRangeParameterTitle(lastHoldingMonth.ref)(loadedState)).toBe(
                "Last holding month",
            );
            expect(selectCatalogDateRangeParameterTitle(untitledPeriod.ref)(loadedState)).toBe(
                "untitledPeriod",
            );
            expect(selectCatalogDateRangeParameterTitle(idRef("deleted", "parameter"))(loadedState)).toBe(
                "deleted",
            );
            expect(selectCatalogDateRangeParameterTitle(topN.ref)(loadedState)).toBe("topN");
        });
    });

    describe("catalog measure-parameter dependency selectors", () => {
        const stateWith = (parameterDependencies: ICatalogParameterDependenciesState): any => ({
            catalog: { parameterDependencies },
        });

        it("returns map and status when loaded", () => {
            const map = { m1: [idRef("topN", "parameter")] };
            const state = stateWith({ status: "loaded", byRoot: map, requestedRoots: {} });
            expect(selectCatalogParameterDependencies(state)).toEqual(map);
            expect(selectCatalogParameterDependenciesStatus(state)).toBe("loaded");
        });

        it("returns uninitialized status by default", () => {
            const state = stateWith({ status: "uninitialized", byRoot: {}, requestedRoots: {} });
            expect(selectCatalogParameterDependenciesStatus(state)).toBe("uninitialized");
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
