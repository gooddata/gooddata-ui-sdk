// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { newBucket, newInsightDefinition, newTotal } from "@gooddata/sdk-model";

import { DASHBOARDS_ENVIRONMENT } from "../../../constants/properties.js";
import { type IVisConstruct } from "../../../interfaces/Visualization.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../utils/translations.js";
import { type ICfTargetData } from "../../configurationControls/conditionalFormatting/conditionalFormattingModel.js";

import { PluggablePivotTableNext, createPivotTableNextConfig } from "./PluggablePivotTableNext.js";

describe("PluggablePivotTableNext", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const backend = dummyBackend();

    function createComponent(pushData: (data: unknown) => void = () => {}): PluggablePivotTableNext {
        return new PluggablePivotTableNext({
            projectId: "PROJECTID",
            backend,
            visualizationProperties: {},
            element: () => mockElement,
            configPanelElement: () => mockConfigElement,
            renderFun: vi.fn(),
            unmountFun: vi.fn(),
            callbacks: {
                afterRender: () => {},
                pushData,
                onError: () => {},
                onLoadingChanged: () => {},
            },
            messages,
        } as unknown as IVisConstruct);
    }

    describe("handleLoadingChanged", () => {
        it("keeps semantic-layer rules across a loading transition, only clearing titles", () => {
            const visualization = createComponent() as unknown as {
                cfTargetData: ICfTargetData;
                onLoadingChanged: (loadingState: { isLoading: boolean }) => void;
                handleLoadingChanged: (loadingState: { isLoading: boolean }) => void;
            };
            visualization.onLoadingChanged = vi.fn();
            const semantic = { m1: { conditions: [] } };
            visualization.cfTargetData = { titles: { m1: "Amount" }, semantic };

            visualization.handleLoadingChanged({ isLoading: true });

            expect(visualization.cfTargetData.semantic).toBe(semantic);
            expect(visualization.cfTargetData.titles).toEqual({});
        });

        it("marks the retained semantic map stale (semanticFresh: false) once a new execution starts", () => {
            const visualization = createComponent() as unknown as {
                cfTargetData: ICfTargetData;
                onLoadingChanged: (loadingState: { isLoading: boolean }) => void;
                handleLoadingChanged: (loadingState: { isLoading: boolean }) => void;
            };
            visualization.onLoadingChanged = vi.fn();
            visualization.cfTargetData = {
                titles: { m1: "Amount" },
                semantic: { m1: { conditions: [] } },
                semanticFresh: true,
            };

            visualization.handleLoadingChanged({ isLoading: true });

            expect(visualization.cfTargetData.semanticFresh).toBe(false);
        });
    });

    describe("handleDataView", () => {
        it("marks the semantic map fresh again (semanticFresh: true) once a fresh data view lands", () => {
            const visualization = createComponent() as unknown as {
                cfTargetData: ICfTargetData;
                currentOptions: unknown;
                onDataView: (dataView: unknown) => void;
                handleDataView: (dataView: unknown) => void;
            };
            visualization.onDataView = vi.fn();
            visualization.currentOptions = {};
            visualization.cfTargetData = { semanticFresh: false };
            const emptyDataView = {
                meta: () => ({
                    measureDescriptors: () => [],
                    attributeDescriptors: () => [],
                    dimensions: () => [],
                    attributeDescriptorsForDim: () => [],
                    attributeHeadersForDim: () => [],
                }),
            };

            visualization.handleDataView(emptyDataView);

            expect(visualization.cfTargetData.semanticFresh).toBe(true);
        });
    });

    describe("handlePushData", () => {
        it("carries a persisted totals override across an unrelated controls change (e.g. toggling header text wrapping), instead of letting CHANGE_PROPERTIES wipe it", () => {
            const pushData = vi.fn();
            const visualization = createComponent(pushData) as unknown as {
                visualizationProperties: { controls?: Record<string, unknown> };
                handlePushData: (data: any) => void;
            };
            const totals = {
                attribute: [
                    { type: "sum", measureIdentifier: "m1", attributeIdentifier: "a1", alias: "Grand Total" },
                ],
            };
            visualization.visualizationProperties = { controls: { totals } };

            visualization.handlePushData({
                properties: { controls: { textWrapping: { wrapHeaderText: true } } },
            });

            const lastCall = pushData.mock.calls.at(-1)?.[0];
            expect(lastCall.properties.controls.textWrapping).toEqual({ wrapHeaderText: true });
            expect(lastCall.properties.controls.totals).toBe(totals);
        });

        it("does not add a totals key when there is no persisted override to carry over", () => {
            const pushData = vi.fn();
            const visualization = createComponent(pushData) as unknown as {
                visualizationProperties: { controls?: Record<string, unknown> };
                handlePushData: (data: any) => void;
            };
            visualization.visualizationProperties = { controls: {} };

            visualization.handlePushData({
                properties: { controls: { textWrapping: { wrapHeaderText: true } } },
            });

            const lastCall = pushData.mock.calls.at(-1)?.[0];
            expect(lastCall.properties.controls.textWrapping).toEqual({ wrapHeaderText: true });
            expect(lastCall.properties.controls.totals).toBeUndefined();
        });
    });

    describe("persistTotalsOverride (via handlePushData on a dashboard)", () => {
        it("only persists the total the user actually renamed, not the whole bucket snapshot - an untouched total must keep following the insight", () => {
            const pushData = vi.fn();
            const visualization = createComponent(pushData) as unknown as {
                environment: string;
                currentInsight: unknown;
                visualizationProperties: { controls?: Record<string, unknown> };
                handlePushData: (data: any) => void;
            };
            visualization.environment = DASHBOARDS_ENVIRONMENT;
            visualization.visualizationProperties = { controls: {} };
            visualization.currentInsight = newInsightDefinition("local:table", (b) =>
                b.buckets([newBucket("attribute", newTotal("sum", "m1", "a1"), newTotal("avg", "m2", "a1"))]),
            );

            visualization.handlePushData({
                properties: {
                    totals: [newTotal("sum", "m1", "a1", "Renamed"), newTotal("avg", "m2", "a1")],
                    bucketType: "attribute",
                },
            });

            const lastCall = pushData.mock.calls.at(-1)?.[0];
            expect(lastCall.properties.controls.totals.attribute).toEqual([
                newTotal("sum", "m1", "a1", "Renamed"),
            ]);
        });

        it("preserves other persisted controls not covered by getPivotTableProperties (pagination, pageSize, conditionalFormatting)", () => {
            const pushData = vi.fn();
            const visualization = createComponent(pushData) as unknown as {
                environment: string;
                currentInsight: unknown;
                visualizationProperties: { controls?: Record<string, unknown> };
                handlePushData: (data: any) => void;
            };
            visualization.environment = DASHBOARDS_ENVIRONMENT;
            visualization.visualizationProperties = {
                controls: {
                    pagination: { enabled: true },
                    pageSize: 50,
                    conditionalFormatting: { enabled: true, rules: [] },
                },
            };
            visualization.currentInsight = newInsightDefinition("local:table", (b) =>
                b.buckets([newBucket("attribute", newTotal("sum", "m1", "a1"))]),
            );

            visualization.handlePushData({
                properties: {
                    totals: [newTotal("sum", "m1", "a1", "Renamed")],
                    bucketType: "attribute",
                },
            });

            const lastCall = pushData.mock.calls.at(-1)?.[0];
            expect(lastCall.properties.controls.pagination).toEqual({ enabled: true });
            expect(lastCall.properties.controls.pageSize).toBe(50);
            expect(lastCall.properties.controls.conditionalFormatting).toEqual({
                enabled: true,
                rules: [],
            });
        });
    });
});

describe("createPivotTableNextConfig", () => {
    it("enables total-label editing with the aggregation menu outside dashboards", () => {
        expect(createPivotTableNextConfig({}, "analyticalDesigner", {}).menu).toEqual({
            aggregations: true,
            aggregationsSubMenu: true,
            aggregationsSubMenuForRows: true,
            totalLabelsEditable: true,
        });
    });

    it("enables only total-label editing in dashboard edit mode", () => {
        expect(createPivotTableNextConfig({ isInEditMode: true }, "dashboards", {}).menu).toEqual({
            totalLabelsEditable: true,
        });
    });

    it("keeps menus disabled in dashboard view mode", () => {
        expect(createPivotTableNextConfig({}, "dashboards", {}).menu).toBeUndefined();
    });

    it("enables the aggregation menu but not total-label editing for the 'none' environment (embedded examples have nowhere to persist an edited label)", () => {
        expect(createPivotTableNextConfig({}, "none", {}).menu).toEqual({
            aggregations: true,
            aggregationsSubMenu: true,
            aggregationsSubMenuForRows: true,
            totalLabelsEditable: false,
        });
    });
});
