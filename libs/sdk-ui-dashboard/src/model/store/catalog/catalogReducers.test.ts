// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import {
    type ICatalogAttributeHierarchy,
    type IDateRangeParameterMetadataObject,
    type IScalarParameterMetadataObject,
    idRef,
    serializeObjRef,
} from "@gooddata/sdk-model";

import { catalogAttributeHierarchies } from "./catalog.test.helpers.js";
import { catalogReducers } from "./catalogReducers.js";
import { type CatalogState } from "./catalogState.js";
import { catalogActions } from "./index.js";

describe("catalogReducers", () => {
    const prepareState = (attributeHierarchies?: ICatalogAttributeHierarchy[]): CatalogState => ({
        attributeHierarchies,
        parameters: {
            status: "uninitialized",
            parameters: [],
            dateRangeParametersStatus: "uninitialized",
            dateRangeParameters: [],
        },
        parameterDependencies: { status: "uninitialized", byRoot: {}, requestedRoots: {} },
    });

    describe("setCatalogItems", () => {
        it("stores undefined measures as undefined", () => {
            const state = prepareState();

            const newState = produce(state, (draft) => {
                const action = catalogActions.setCatalogItems({});
                catalogReducers.setCatalogItems(draft, action);
            });

            expect(newState.measures).toBeUndefined();
        });
    });

    describe("setCatalogParameters", () => {
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

        it("transitions both statuses and stores both parameter lists", () => {
            const state = prepareState();
            const newState = produce(state, (draft) => {
                const action = catalogActions.setCatalogParameters({
                    status: "loaded",
                    parameters: [topN],
                    dateRangeParametersStatus: "loaded",
                    dateRangeParameters: [lastHoldingMonth],
                });
                catalogReducers.setCatalogParameters(draft, action);
            });
            expect(newState.parameters).toEqual({
                status: "loaded",
                parameters: [topN],
                dateRangeParametersStatus: "loaded",
                dateRangeParameters: [lastHoldingMonth],
            });
        });

        it("records the status of each list with empty parameters", () => {
            const state = prepareState();
            const newState = produce(state, (draft) => {
                const action = catalogActions.setCatalogParameters({
                    status: "failed",
                    parameters: [],
                    dateRangeParametersStatus: "gated-off",
                    dateRangeParameters: [],
                });
                catalogReducers.setCatalogParameters(draft, action);
            });
            expect(newState.parameters).toEqual({
                status: "failed",
                parameters: [],
                dateRangeParametersStatus: "gated-off",
                dateRangeParameters: [],
            });
        });
    });

    describe("setCatalogParameterDependencies", () => {
        const insightRef = idRef("insight-1", "insight");
        const paramRef = idRef("topN", "parameter");

        it("stores the insight → parameters map and transitions status to loaded", () => {
            const state = prepareState();
            const newState = produce(state, (draft) => {
                const action = catalogActions.setCatalogParameterDependencies({
                    status: "loaded",
                    byRoot: { [serializeObjRef(insightRef)]: [paramRef] },
                    requestedRoots: {},
                });
                catalogReducers.setCatalogParameterDependencies(draft, action);
            });
            expect(newState.parameterDependencies).toEqual({
                status: "loaded",
                byRoot: { [serializeObjRef(insightRef)]: [paramRef] },
                requestedRoots: {},
            });
        });
    });

    describe("mergeCatalogParameterDependencies", () => {
        const insightRef = idRef("insight-1", "insight");
        const addedInsightRef = idRef("insight-2", "insight");
        const paramRef = idRef("topN", "parameter");
        const otherParamRef = idRef("sampleSize", "parameter");

        it("adds the new insights to the loaded map and keeps the existing entries", () => {
            const loaded = produce(prepareState(), (draft) => {
                catalogReducers.setCatalogParameterDependencies(
                    draft,
                    catalogActions.setCatalogParameterDependencies({
                        status: "loaded",
                        byRoot: { [serializeObjRef(insightRef)]: [paramRef] },
                        requestedRoots: {},
                    }),
                );
            });
            const newState = produce(loaded, (draft) => {
                catalogReducers.mergeCatalogParameterDependencies(
                    draft,
                    catalogActions.mergeCatalogParameterDependencies({
                        [serializeObjRef(addedInsightRef)]: [otherParamRef],
                    }),
                );
            });
            expect(newState.parameterDependencies).toEqual({
                status: "loaded",
                byRoot: {
                    [serializeObjRef(insightRef)]: [paramRef],
                    [serializeObjRef(addedInsightRef)]: [otherParamRef],
                },
                requestedRoots: {},
            });
        });

        it("clears the mark of every root it merges", () => {
            const pending = produce(prepareState(), (draft) => {
                catalogReducers.markParameterDependenciesPending(
                    draft,
                    catalogActions.markParameterDependenciesPending([insightRef, addedInsightRef]),
                );
            });
            const newState = produce(pending, (draft) => {
                catalogReducers.mergeCatalogParameterDependencies(
                    draft,
                    catalogActions.mergeCatalogParameterDependencies({
                        [serializeObjRef(insightRef)]: [paramRef],
                    }),
                );
            });
            expect(newState.parameterDependencies.requestedRoots).toEqual({
                [serializeObjRef(addedInsightRef)]: "pending",
            });
        });
    });

    describe("markParameterDependenciesPending and markParameterDependenciesFailed", () => {
        const insightRef = idRef("insight-1", "insight");

        it("marks a root pending", () => {
            const newState = produce(prepareState(), (draft) => {
                catalogReducers.markParameterDependenciesPending(
                    draft,
                    catalogActions.markParameterDependenciesPending([insightRef]),
                );
            });
            expect(newState.parameterDependencies.requestedRoots).toEqual({
                [serializeObjRef(insightRef)]: "pending",
            });
        });

        it("marks a pending root failed", () => {
            const pending = produce(prepareState(), (draft) => {
                catalogReducers.markParameterDependenciesPending(
                    draft,
                    catalogActions.markParameterDependenciesPending([insightRef]),
                );
            });
            const newState = produce(pending, (draft) => {
                catalogReducers.markParameterDependenciesFailed(
                    draft,
                    catalogActions.markParameterDependenciesFailed([insightRef]),
                );
            });
            expect(newState.parameterDependencies.requestedRoots).toEqual({
                [serializeObjRef(insightRef)]: "failed",
            });
        });
    });

    describe("addAttributeHierarchy", () => {
        const newAttributeHierarchy: ICatalogAttributeHierarchy = {
            type: "attributeHierarchy",
            attributeHierarchy: {
                type: "attributeHierarchy",
                id: "7e453e94-ab42-4664-a86a-9c205de04cad_new",
                uri: "https://staging.dev-latest.stg11.panther.intgdc.com/api/v1/entities/workspaces/6474f8829a36409d8ebc72abbc60e750/attributeHierarchies/7e453e94-ab42-4664-a86a-9c205de04cad",
                ref: {
                    identifier: "7e453e94-ab42-4664-a86a-9c205de04cad_new",
                    type: "attributeHierarchy",
                },
                title: "Attribute Hierarchy 6",
                description: "Attribute Hierarchy 6",
                attributes: [
                    {
                        identifier: "f_owner.department_id",
                        type: "attribute",
                    },
                    {
                        identifier: "attr.f_account.account",
                        type: "attribute",
                    },
                    {
                        identifier: "f_owner.department_id_new_item",
                        type: "attribute",
                    },
                ],
                production: true,
                deprecated: false,
                unlisted: false,
            },
        };

        it("should add attribute hierarchy into empty state", () => {
            const state = prepareState();

            const newState = produce(state, (draft) => {
                const action = catalogActions.addAttributeHierarchy(newAttributeHierarchy);
                catalogReducers.addAttributeHierarchy(draft, action);
            });

            expect(newState).toMatchSnapshot();
        });

        it("should add attribute hierarchy", () => {
            const state = prepareState(catalogAttributeHierarchies);
            const newState = produce(state, (draft) => {
                const action = catalogActions.addAttributeHierarchy(newAttributeHierarchy);
                catalogReducers.addAttributeHierarchy(draft, action);
            });

            expect(newState).toMatchSnapshot();
        });
    });

    describe("updateAttributeHierarchy", () => {
        it("should update attribute hierarchy", () => {
            const state = prepareState(catalogAttributeHierarchies);
            const attributeHierarchy: ICatalogAttributeHierarchy = {
                ...catalogAttributeHierarchies[2],
                attributeHierarchy: {
                    ...catalogAttributeHierarchies[2].attributeHierarchy,
                    title: "Attribute Hierarchy changed",
                },
            };

            const newState = produce(state, (draft) => {
                const action = catalogActions.updateAttributeHierarchy(attributeHierarchy);
                catalogReducers.updateAttributeHierarchy(draft, action);
            });

            expect(newState).toMatchSnapshot();
        });
    });

    describe("deleteAttributeHierarchy", () => {
        it("should delete attribute hierarchy", () => {
            const state = prepareState(catalogAttributeHierarchies);
            const attributeHierarchy: ICatalogAttributeHierarchy = {
                ...catalogAttributeHierarchies[2],
            };

            const newState = produce(state, (draft) => {
                const action = catalogActions.deleteAttributeHierarchy(attributeHierarchy);
                catalogReducers.deleteAttributeHierarchy(draft, action);
            });

            expect(newState).toMatchSnapshot();
        });
    });
});
