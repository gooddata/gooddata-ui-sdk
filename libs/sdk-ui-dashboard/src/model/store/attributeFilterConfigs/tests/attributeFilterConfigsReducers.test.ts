// (C) 2023 GoodData Corporation
import { produce } from "immer";
import { describe, it, expect } from "vitest";
import cloneDeep from "lodash/cloneDeep.js";
import { DashboardDateFilterConfigModeValues, IDashboardAttributeFilterConfig } from "@gooddata/sdk-model";

import { attributeFilterConfigsActions } from "../index.js";
import { attributeFilterConfigsReducers } from "../attributeFilterConfigsReducers.js";
import { AttributeFilterConfigsState } from "../attributeFilterConfigsState.js";

describe("attributeFilterConfigsReducers", () => {
    const createAttributeFilterConfigSliceInitialState = (
        attributeFilterConfigs?: IDashboardAttributeFilterConfig[],
    ): AttributeFilterConfigsState => {
        return {
            attributeFilterConfigs: attributeFilterConfigs ? cloneDeep(attributeFilterConfigs) : [],
        };
    };

    describe("setAttributeFilterConfigs", () => {
        it("should set the attribute filter configs", () => {
            const initialAttributeFilterConfigs: IDashboardAttributeFilterConfig[] = [
                {
                    mode: "hidden",
                    localIdentifier: "id1",
                },
            ];
            const initialState = createAttributeFilterConfigSliceInitialState(initialAttributeFilterConfigs);
            const newMode = DashboardDateFilterConfigModeValues.READONLY;

            const newState: any = produce(initialState, (draft: any) => {
                const action = attributeFilterConfigsActions.setAttributeFilterConfigs({
                    attributeFilterConfigs: [
                        {
                            ...initialAttributeFilterConfigs[0],
                            mode: newMode,
                        },
                    ],
                });
                return attributeFilterConfigsReducers.setAttributeFilterConfigs(draft, action);
            });

            expect(newState.attributeFilterConfigs).toEqual([
                {
                    ...initialAttributeFilterConfigs[0],
                    mode: newMode,
                },
            ]);
        });

        it("should create a new attribute filter config if it doesn't exist", () => {
            const initialState = createAttributeFilterConfigSliceInitialState(undefined);

            const newState = produce(initialState, (draft) => {
                const action = attributeFilterConfigsActions.setAttributeFilterConfigs({
                    attributeFilterConfigs: [
                        {
                            localIdentifier: "id2",
                            mode: DashboardDateFilterConfigModeValues.HIDDEN,
                        },
                    ],
                });
                return attributeFilterConfigsReducers.setAttributeFilterConfigs(draft, action);
            });

            expect(newState.attributeFilterConfigs).toEqual([
                {
                    mode: DashboardDateFilterConfigModeValues.HIDDEN,
                    localIdentifier: "id2",
                },
            ]);
        });
    });

    describe("changeMode", () => {
        const initialState = createAttributeFilterConfigSliceInitialState([
            {
                localIdentifier: "id1",
                mode: DashboardDateFilterConfigModeValues.HIDDEN,
            },
        ]);

        it("should set the attribute filter configs", () => {
            const newMode = DashboardDateFilterConfigModeValues.READONLY;
            const newState: any = produce(initialState, (draft: any) => {
                const action = attributeFilterConfigsActions.changeMode({
                    localIdentifier: "id1",
                    mode: newMode,
                });
                return attributeFilterConfigsReducers.changeMode(draft, action);
            });

            expect(newState.attributeFilterConfigs).toEqual([
                {
                    localIdentifier: "id1",
                    mode: newMode,
                },
            ]);
        });

        it("should create a new attribute filter config if it doesn't exist", () => {
            const newState = produce(initialState, (draft) => {
                const action = attributeFilterConfigsActions.changeMode({
                    localIdentifier: "id2",
                    mode: DashboardDateFilterConfigModeValues.ACTIVE,
                });
                return attributeFilterConfigsReducers.changeMode(draft, action);
            });

            expect(newState.attributeFilterConfigs).toEqual([
                {
                    localIdentifier: "id1",
                    mode: DashboardDateFilterConfigModeValues.HIDDEN,
                },
                {
                    mode: DashboardDateFilterConfigModeValues.ACTIVE,
                    localIdentifier: "id2",
                },
            ]);
        });
    });
});
