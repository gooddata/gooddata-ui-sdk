// (C) 2023-2024 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";

import { selectGlobalDrillsDownAttributeHierarchyByWidgetRef } from "../widgetDrillSelectors.js";
import {
    availableDrillTargets,
    catalogAttributeHierarchies,
    ignoredHierarchies,
    widgetRef,
    widgetRefWithoutAvailableDrillTargets,
} from "./widgetDrillSelectors.fixture.js";
import * as drillTargetsSelectors from "../../drillTargets/drillTargetsSelectors.js";
import * as layoutSelectors from "../../layout/layoutSelectors.js";

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
                supportsAttributeHierarchies?: boolean;
            } = {},
        ): any => {
            return {
                catalog: {
                    attributeHierarchies: catalogAttributeHierarchies,
                },
                config: { config: {} },
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

            vi.spyOn(layoutSelectors, "selectIgnoredDrillDownHierarchiesByWidgetRef").mockImplementation(
                (widget: ObjRef) => {
                    if (objRefToString(widget) === objRefToString(widgetRef)) {
                        return () => ignoredHierarchies;
                    }

                    return () => [];
                },
            );
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        it("should return empty array if supportsAttributeHierarchies is off", () => {
            const initialState = createInitialState({
                supportsAttributeHierarchies: false,
            });
            expect(selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRef)(initialState)).toEqual([]);
        });

        it("should return expected result if all conditions are met", () => {
            const initialState = createInitialState({
                supportsAttributeHierarchies: true,
            });

            expect(
                selectGlobalDrillsDownAttributeHierarchyByWidgetRef(widgetRef)(initialState),
            ).toMatchSnapshot();
        });

        it("should return empty array if no drill targets are available", () => {
            const initialState = createInitialState({
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
