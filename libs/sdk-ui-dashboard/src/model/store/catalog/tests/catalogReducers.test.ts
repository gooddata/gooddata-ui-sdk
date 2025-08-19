// (C) 2023-2025 GoodData Corporation
import { produce } from "immer";
import { describe, expect, it } from "vitest";

import { ICatalogAttributeHierarchy } from "@gooddata/sdk-model";

import { catalogAttributeHierarchies } from "./catalog.fixture.js";
import { catalogReducers } from "../catalogReducers.js";
import { CatalogState } from "../catalogState.js";
import { catalogActions } from "../index.js";

describe("catalogReducers", () => {
    const prepareState = (attributeHierarchies?: ICatalogAttributeHierarchy[]): CatalogState => ({
        attributeHierarchies,
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
