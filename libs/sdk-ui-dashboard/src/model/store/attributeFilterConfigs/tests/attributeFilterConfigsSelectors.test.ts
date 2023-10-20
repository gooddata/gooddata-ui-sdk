// (C) 2023 GoodData Corporation
import { describe, it, expect } from "vitest";

import {
    DashboardAttributeFilterConfigModeValues,
    IDashboardAttributeFilterConfig,
} from "@gooddata/sdk-model";

import { selectAttributeFilterConfigsOverrides } from "../attributeFilterConfigsSelectors.js";
import { AttributeFilterConfigsState } from "../attributeFilterConfigsState.js";

describe("attributeFilterConfigsSelectors", () => {
    const createInitialState = (attributeFilterConfigs?: AttributeFilterConfigsState): any => {
        return {
            attributeFilterConfigs,
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
});
