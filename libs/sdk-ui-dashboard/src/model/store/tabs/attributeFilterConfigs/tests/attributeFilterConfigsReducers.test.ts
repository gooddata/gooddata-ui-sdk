// (C) 2023-2025 GoodData Corporation

import { produce } from "immer";
import { cloneDeep } from "lodash-es";
import { describe, expect, it } from "vitest";

import { DashboardDateFilterConfigModeValues, IDashboardAttributeFilterConfig } from "@gooddata/sdk-model";

import { TabsState, tabsActions } from "../../index.js";
import { attributeFilterConfigsReducers } from "../attributeFilterConfigsReducers.js";

describe("attributeFilterConfigsReducers", () => {
    const createAttributeFilterConfigSliceInitialState = (
        attributeFilterConfigs?: IDashboardAttributeFilterConfig[],
    ): TabsState => {
        return {
            tabs: [
                {
                    localIdentifier: "tab-1",
                    title: "Test Tab",
                    dateFilterConfigs: undefined,
                    dateFilterConfig: undefined,
                    attributeFilterConfigs: attributeFilterConfigs
                        ? { attributeFilterConfigs: cloneDeep(attributeFilterConfigs) }
                        : { attributeFilterConfigs: [] },
                },
            ],
            activeTabLocalIdentifier: "tab-1",
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
                const action = tabsActions.setAttributeFilterConfigs({
                    attributeFilterConfigs: [
                        {
                            ...initialAttributeFilterConfigs[0],
                            mode: newMode,
                        },
                    ],
                });
                return attributeFilterConfigsReducers.setAttributeFilterConfigs(draft, action);
            });

            expect(newState.tabs?.[0]?.attributeFilterConfigs?.attributeFilterConfigs).toEqual([
                {
                    ...initialAttributeFilterConfigs[0],
                    mode: newMode,
                },
            ]);
        });

        it("should create a new attribute filter config if it doesn't exist", () => {
            const initialState = createAttributeFilterConfigSliceInitialState(undefined);

            const newState = produce(initialState, (draft) => {
                const action = tabsActions.setAttributeFilterConfigs({
                    attributeFilterConfigs: [
                        {
                            localIdentifier: "id2",
                            mode: DashboardDateFilterConfigModeValues.HIDDEN,
                        },
                    ],
                });
                return attributeFilterConfigsReducers.setAttributeFilterConfigs(draft, action);
            });

            expect(newState.tabs?.[0]?.attributeFilterConfigs?.attributeFilterConfigs).toEqual([
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
                const action = tabsActions.changeAttributeFilterConfigMode({
                    localIdentifier: "id1",
                    mode: newMode,
                });
                return attributeFilterConfigsReducers.changeAttributeFilterConfigMode(draft, action);
            });

            expect(newState.tabs?.[0]?.attributeFilterConfigs?.attributeFilterConfigs).toEqual([
                {
                    localIdentifier: "id1",
                    mode: newMode,
                },
            ]);
        });

        it("should create a new attribute filter config if it doesn't exist", () => {
            const newState = produce(initialState, (draft) => {
                const action = tabsActions.changeAttributeFilterConfigMode({
                    localIdentifier: "id2",
                    mode: DashboardDateFilterConfigModeValues.ACTIVE,
                });
                return attributeFilterConfigsReducers.changeAttributeFilterConfigMode(draft, action);
            });

            expect(newState.tabs?.[0]?.attributeFilterConfigs?.attributeFilterConfigs).toEqual([
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
