// (C) 2023 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";

import { selectGlobalDrillsDownAttributeHierarchyByWidgetRef } from "../widgetDrillSelectors.js";
import {
    availableDrillTargets,
    catalogAttributeHierarchies,
    widgetRef,
    widgetRefWithoutAvailableDrillTargets,
} from "./widgetDrillSelectors.fixture.js";
import * as drillTargetsSelectors from "../../drillTargets/drillTargetsSelectors.js";

let isDisableDrillDown = false;
vi.mock("../../insights/insightsSelectors.js", () => ({
    selectInsightByWidgetRef: () => () => ({
        insight: {
            properties: {
                controls: {
                    disableDrillDown: isDisableDrillDown,
                },
            },
        },
    }),
}));

describe("widgetDrillSelectors", () => {
    describe("selectGlobalDrillsDownAttributeHierarchyByWidgetRef", () => {
        const createInitialState = (
            params: {
                enableAttributeHierarchies?: boolean;
                supportsAttributeHierarchies?: boolean;
            } = {},
        ): any => {
            return {
                catalog: {
                    attributeHierarchies: catalogAttributeHierarchies,
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

        beforeEach(() => {
            vi.spyOn(drillTargetsSelectors, "selectDrillTargetsByWidgetRef").mockImplementation(
                (widget: ObjRef) => {
                    if (objRefToString(widget) === objRefToString(widgetRef)) {
                        return () => availableDrillTargets;
                    }

                    return () => undefined;
                },
            );
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        it("should return empty array if enableAttributeHierarchies is off", () => {
            const initialState = createInitialState({
                enableAttributeHierarchies: false,
                supportsAttributeHierarchies: true,
            });
            expect(selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRef)(initialState)).toEqual([]);
        });

        it("should return empty array if supportsAttributeHierarchies is off", () => {
            const initialState = createInitialState({
                enableAttributeHierarchies: true,
                supportsAttributeHierarchies: false,
            });
            expect(selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRef)(initialState)).toEqual([]);
        });

        it("should return expected result if all conditions are met", () => {
            const initialState = createInitialState({
                enableAttributeHierarchies: true,
                supportsAttributeHierarchies: true,
            });

            expect(
                selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRef)(initialState),
            ).toMatchSnapshot();
        });

        it("should return empty array if no drill targets are available", () => {
            const initialState = createInitialState({
                enableAttributeHierarchies: true,
                supportsAttributeHierarchies: true,
            });
            expect(
                selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRefWithoutAvailableDrillTargets)(
                    initialState,
                ),
            ).toEqual([]);
        });

        it("should return empty array if the disableDrillDown is true", () => {
            isDisableDrillDown = true;
            const initialState = createInitialState({
                enableAttributeHierarchies: true,
                supportsAttributeHierarchies: true,
            });
            expect(
                selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRefWithoutAvailableDrillTargets)(
                    initialState,
                ),
            ).toEqual([]);
        });
    });
});
