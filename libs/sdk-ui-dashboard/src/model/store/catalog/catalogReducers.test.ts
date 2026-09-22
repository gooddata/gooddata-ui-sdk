// (C) 2023-2026 GoodData Corporation

// @vitest-environment node

import { produce } from "immer";
import { describe, expect, it } from "vitest";

import {
    type ICatalogAttributeHierarchy,
    type IParameterMetadataObject,
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
        parameters: { status: "uninitialized", parameters: [] },
        insightParameters: { status: "uninitialized", byInsight: {} },
        filterParameters: { status: "uninitialized", byRef: {} },
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

        it("transitions status and stores parameters", () => {
            const state = prepareState();
            const newState = produce(state, (draft) => {
                const action = catalogActions.setCatalogParameters({
                    status: "loaded",
                    parameters: [topN],
                });
                catalogReducers.setCatalogParameters(draft, action);
            });
            expect(newState.parameters).toEqual({ status: "loaded", parameters: [topN] });
        });

        it("records failed status with empty parameters", () => {
            const state = prepareState();
            const newState = produce(state, (draft) => {
                const action = catalogActions.setCatalogParameters({
                    status: "failed",
                    parameters: [],
                });
                catalogReducers.setCatalogParameters(draft, action);
            });
            expect(newState.parameters).toEqual({ status: "failed", parameters: [] });
        });
    });

    describe("setCatalogInsightParameters", () => {
        const insightRef = idRef("insight-1", "insight");
        const paramRef = idRef("topN", "parameter");

        it("stores the insight → parameters map and transitions status to loaded", () => {
            const state = prepareState();
            const newState = produce(state, (draft) => {
                const action = catalogActions.setCatalogInsightParameters({
                    status: "loaded",
                    byInsight: { [serializeObjRef(insightRef)]: [paramRef] },
                });
                catalogReducers.setCatalogInsightParameters(draft, action);
            });
            expect(newState.insightParameters).toEqual({
                status: "loaded",
                byInsight: { [serializeObjRef(insightRef)]: [paramRef] },
            });
        });

        it("records failed status with empty map", () => {
            const state = prepareState();
            const newState = produce(state, (draft) => {
                const action = catalogActions.setCatalogInsightParameters({
                    status: "failed",
                    byInsight: {},
                });
                catalogReducers.setCatalogInsightParameters(draft, action);
            });
            expect(newState.insightParameters).toEqual({ status: "failed", byInsight: {} });
        });
    });

    describe("mergeCatalogInsightParameters", () => {
        const insightRef = idRef("insight-1", "insight");
        const addedInsightRef = idRef("insight-2", "insight");
        const paramRef = idRef("topN", "parameter");
        const otherParamRef = idRef("sampleSize", "parameter");

        it("adds the new insights to the loaded map and keeps the existing entries", () => {
            const loaded = produce(prepareState(), (draft) => {
                catalogReducers.setCatalogInsightParameters(
                    draft,
                    catalogActions.setCatalogInsightParameters({
                        status: "loaded",
                        byInsight: { [serializeObjRef(insightRef)]: [paramRef] },
                    }),
                );
            });
            const newState = produce(loaded, (draft) => {
                catalogReducers.mergeCatalogInsightParameters(
                    draft,
                    catalogActions.mergeCatalogInsightParameters({
                        [serializeObjRef(addedInsightRef)]: [otherParamRef],
                    }),
                );
            });
            expect(newState.insightParameters).toEqual({
                status: "loaded",
                byInsight: {
                    [serializeObjRef(insightRef)]: [paramRef],
                    [serializeObjRef(addedInsightRef)]: [otherParamRef],
                },
            });
        });
    });

    describe("setCatalogFilterParameters", () => {
        const metricRef = idRef("m1", "measure");
        const paramRef = idRef("topN", "parameter");

        it("stores the filter root → parameters map and transitions status to loaded", () => {
            const newState = produce(prepareState(), (draft) => {
                catalogReducers.setCatalogFilterParameters(
                    draft,
                    catalogActions.setCatalogFilterParameters({
                        status: "loaded",
                        byRef: { [serializeObjRef(metricRef)]: [paramRef] },
                    }),
                );
            });
            expect(newState.filterParameters).toEqual({
                status: "loaded",
                byRef: { [serializeObjRef(metricRef)]: [paramRef] },
            });
        });

        it("records failed status with empty map", () => {
            const newState = produce(prepareState(), (draft) => {
                catalogReducers.setCatalogFilterParameters(
                    draft,
                    catalogActions.setCatalogFilterParameters({ status: "failed", byRef: {} }),
                );
            });
            expect(newState.filterParameters).toEqual({ status: "failed", byRef: {} });
        });
    });

    describe("mergeCatalogFilterParameters", () => {
        const metricRef = idRef("m1", "measure");
        const computedAttributeRef = idRef("ca1", "computedAttribute");
        const paramRef = idRef("topN", "parameter");
        const otherParamRef = idRef("sampleSize", "parameter");

        it("adds the new roots to the loaded map and keeps the existing entries", () => {
            const loaded = produce(prepareState(), (draft) => {
                catalogReducers.setCatalogFilterParameters(
                    draft,
                    catalogActions.setCatalogFilterParameters({
                        status: "loaded",
                        byRef: { [serializeObjRef(metricRef)]: [paramRef] },
                    }),
                );
            });
            const newState = produce(loaded, (draft) => {
                catalogReducers.mergeCatalogFilterParameters(
                    draft,
                    catalogActions.mergeCatalogFilterParameters({
                        [serializeObjRef(computedAttributeRef)]: [otherParamRef],
                    }),
                );
            });
            expect(newState.filterParameters).toEqual({
                status: "loaded",
                byRef: {
                    [serializeObjRef(metricRef)]: [paramRef],
                    [serializeObjRef(computedAttributeRef)]: [otherParamRef],
                },
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
