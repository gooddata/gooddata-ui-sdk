// (C) 2023 GoodData Corporation
import { describe, it, expect } from "vitest";

import {
    DashboardAttributeFilterConfigModeValues,
    IDashboardAttributeFilterConfig,
} from "@gooddata/sdk-model";

import {
    selectAttributeFilterConfigsModeMap,
    selectAttributeFilterConfigsOverrides,
    selectEffectiveAttributeFiltersModeMap,
} from "../attributeFilterConfigsSelectors.js";
import { AttributeFilterConfigsState } from "../attributeFilterConfigsState.js";

describe("attributeFilterConfigsSelectors", () => {
    const createInitialState = (
        attributeFilterConfigs?: AttributeFilterConfigsState,
        renderMode?: string,
    ): any => {
        return {
            attributeFilterConfigs,
            renderMode: {
                renderMode,
            },
        };
    };

    describe("selectAttributeFilterConfigsOverrides", () => {
        it("should return an empty array when attributeFilterConfigs state is undefined", () => {
            const state = createInitialState(undefined);
            expect(selectAttributeFilterConfigsOverrides(state)).toEqual([]);
        });

        it("should return an empty array when attributeFilterConfigs is undefined", () => {
            const state = createInitialState({});
            expect(selectAttributeFilterConfigsOverrides(state)).toEqual([]);
        });

        it("should return attributeFilterConfigs when it not empty", () => {
            const configs: IDashboardAttributeFilterConfig[] = [
                { localIdentifier: "id_1", mode: DashboardAttributeFilterConfigModeValues.HIDDEN },
                { localIdentifier: "id_2", mode: DashboardAttributeFilterConfigModeValues.READONLY },
                { localIdentifier: "id_3", mode: DashboardAttributeFilterConfigModeValues.ACTIVE },
            ];

            const state = createInitialState({
                attributeFilterConfigs: configs,
            });
            expect(selectAttributeFilterConfigsOverrides(state)).toEqual(configs);
        });
    });

    describe("selectAttributeFilterConfigsModeMap", () => {
        it("should return a map of attribute filter config modes", () => {
            const configs: IDashboardAttributeFilterConfig[] = [
                { localIdentifier: "id_1", mode: DashboardAttributeFilterConfigModeValues.HIDDEN },
                { localIdentifier: "id_2", mode: DashboardAttributeFilterConfigModeValues.READONLY },
                { localIdentifier: "id_3", mode: DashboardAttributeFilterConfigModeValues.ACTIVE },
                { localIdentifier: "id_4" },
            ];

            const state = createInitialState({
                attributeFilterConfigs: configs,
            });

            const expectedMap = new Map([
                ["id_1", DashboardAttributeFilterConfigModeValues.HIDDEN],
                ["id_2", DashboardAttributeFilterConfigModeValues.READONLY],
                ["id_3", DashboardAttributeFilterConfigModeValues.ACTIVE],
                ["id_4", DashboardAttributeFilterConfigModeValues.ACTIVE],
            ]);

            expect(selectAttributeFilterConfigsModeMap(state)).toEqual(expectedMap);
        });
    });

    describe("selectEffectiveAttributeFiltersModeMap", () => {
        it("should return a map of effective attribute filter config modes", () => {
            const configs: IDashboardAttributeFilterConfig[] = [
                { localIdentifier: "id_1", mode: DashboardAttributeFilterConfigModeValues.HIDDEN },
                { localIdentifier: "id_2", mode: DashboardAttributeFilterConfigModeValues.READONLY },
                { localIdentifier: "id_3", mode: DashboardAttributeFilterConfigModeValues.ACTIVE },
                { localIdentifier: "id_4" },
            ];

            const state = createInitialState(
                {
                    attributeFilterConfigs: configs,
                },
                "view",
            );

            const expectedMap = new Map([
                ["id_1", DashboardAttributeFilterConfigModeValues.HIDDEN],
                ["id_2", DashboardAttributeFilterConfigModeValues.READONLY],
                ["id_3", DashboardAttributeFilterConfigModeValues.ACTIVE],
                ["id_4", DashboardAttributeFilterConfigModeValues.ACTIVE],
            ]);

            expect(selectEffectiveAttributeFiltersModeMap(state)).toEqual(expectedMap);
        });

        it("should return a map of active attribute filter config modes when isInEditMode is true", () => {
            const configs: IDashboardAttributeFilterConfig[] = [
                { localIdentifier: "id_1", mode: DashboardAttributeFilterConfigModeValues.HIDDEN },
                { localIdentifier: "id_2", mode: DashboardAttributeFilterConfigModeValues.READONLY },
                { localIdentifier: "id_3", mode: DashboardAttributeFilterConfigModeValues.ACTIVE },
                { localIdentifier: "id_4" },
            ];

            const state = createInitialState(
                {
                    attributeFilterConfigs: configs,
                },
                "edit",
            );

            const expectedMap = new Map([
                ["id_1", DashboardAttributeFilterConfigModeValues.ACTIVE],
                ["id_2", DashboardAttributeFilterConfigModeValues.ACTIVE],
                ["id_3", DashboardAttributeFilterConfigModeValues.ACTIVE],
                ["id_4", DashboardAttributeFilterConfigModeValues.ACTIVE],
            ]);

            expect(selectEffectiveAttributeFiltersModeMap(state)).toEqual(expectedMap);
        });
    });
});
