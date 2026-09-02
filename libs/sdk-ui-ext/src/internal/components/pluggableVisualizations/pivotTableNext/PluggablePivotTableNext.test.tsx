// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { type IVisConstruct } from "../../../interfaces/Visualization.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../utils/translations.js";
import { type ICfTargetData } from "../../configurationControls/conditionalFormatting/conditionalFormattingModel.js";

import { PluggablePivotTableNext } from "./PluggablePivotTableNext.js";

describe("PluggablePivotTableNext", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const backend = dummyBackend();

    function createComponent(): PluggablePivotTableNext {
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
                pushData: () => {},
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
});
