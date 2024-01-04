// (C) 2023 GoodData Corporation

import { describe, expect, it } from "vitest";
import { selectAdhocDateHierarchies } from "../catalogSelectors.js";
import { catalogDateDatasets, defaultDateHierarchyTemplates } from "./catalogSelectors.fixture.js";

describe("catalogSelectors", () => {
    const createInitialState = (
        params: {
            enableAttributeHierarchies?: boolean;
            supportsAttributeHierarchies?: boolean;
        } = {},
    ): any => {
        return {
            catalog: {
                dateHierarchyTemplates: defaultDateHierarchyTemplates,
                dateDatasets: catalogDateDatasets,
            },
            config: {
                config: {
                    settings: {
                        enableAttributeHierarchies: params?.enableAttributeHierarchies ?? false,
                    },
                },
            },
            backendCapabilities: {
                backendCapabilities: {
                    supportsAttributeHierarchies: params?.supportsAttributeHierarchies ?? false,
                },
            },
        };
    };

    it("should return empty array if enableAttributeHierarchies is off", () => {
        const initialState = createInitialState({
            enableAttributeHierarchies: false,
            supportsAttributeHierarchies: true,
        });
        expect(selectAdhocDateHierarchies(initialState)).toEqual([]);
    });

    it("should return empty array if supportsAttributeHierarchies is off", () => {
        const initialState = createInitialState({
            enableAttributeHierarchies: true,
            supportsAttributeHierarchies: false,
        });
        expect(selectAdhocDateHierarchies(initialState)).toEqual([]);
    });

    it("should return adhoc date hierarchies", () => {
        const initialState = createInitialState({
            enableAttributeHierarchies: true,
            supportsAttributeHierarchies: true,
        });
        expect(selectAdhocDateHierarchies(initialState)).toMatchSnapshot();
    });
});
