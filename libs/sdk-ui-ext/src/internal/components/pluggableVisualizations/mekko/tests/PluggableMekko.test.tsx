// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { type IReferencePoint, type IVisConstruct } from "../../../../interfaces/Visualization.js";
import {
    attributeItems,
    derivedMeasureItems,
    emptyReferencePoint,
    masterMeasureItems,
} from "../../../../tests/mocks/referencePointMocks.js";
import { insightWithSingleMeasure } from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { getLastRenderEl } from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggableMekko } from "../PluggableMekko.js";

const emptyFilters = { localIdentifier: "filters", items: [] as any[] };

// Build a Mekko-shaped reference point: Width -> measures, Height -> secondary_measures,
// viewBy -> view, stackBy -> stack.
function referencePoint(buckets: { measures?: any[]; view?: any[]; stack?: any[] }): IReferencePoint {
    return {
        buckets: [
            { localIdentifier: "measures", items: buckets.measures ?? [] },
            { localIdentifier: "view", items: buckets.view ?? [] },
            { localIdentifier: "stack", items: buckets.stack ?? [] },
        ],
        filters: emptyFilters,
    } as unknown as IReferencePoint;
}

describe("PluggableMekko", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps = {
        projectId: "PROJECTID",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: () => {},
            pushData: () => {},
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
        messages,
    };

    function createComponent(props = defaultProps) {
        return new PluggableMekko(props as unknown as IVisConstruct);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        expect(createComponent()).toBeTruthy();
    });

    describe("getExtendedReferencePoint - bucket transforms", () => {
        it("should split two measures into Width (measures) + Height (secondary_measures) and place viewBy/stackBy", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({
                    measures: [masterMeasureItems[0], masterMeasureItems[1]],
                    view: [attributeItems[0]],
                    stack: [attributeItems[1]],
                }),
            );

            expect(extended).toMatchSnapshot();
        });

        it("should keep a single measure as Width only, with empty Height/stack", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({ measures: [masterMeasureItems[0]], view: [attributeItems[0]] }),
            );

            expect(extended).toMatchSnapshot();
        });

        it("should cap at two measures (Width + Height) and one viewBy / one stackBy", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({
                    measures: [masterMeasureItems[0], masterMeasureItems[1], masterMeasureItems[2]],
                    view: [attributeItems[0], attributeItems[1]],
                    stack: [attributeItems[2]],
                }),
            );

            expect(extended).toMatchSnapshot();
        });

        it("should remove derived measures", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({ measures: [masterMeasureItems[0], derivedMeasureItems[0]] }),
            );

            expect(extended).toMatchSnapshot();
        });
    });

    describe("uiConfig", () => {
        it("should enable optional stacking (for the Stack to 100% control)", async () => {
            const extended = await createComponent().getExtendedReferencePoint(emptyReferencePoint);
            expect(extended.uiConfig!.optionalStacking).toEqual({ supported: true, stackMeasures: false });
        });

        it("should not support over-time comparison", async () => {
            const extended = await createComponent().getExtendedReferencePoint(emptyReferencePoint);
            expect(extended.uiConfig!.supportedOverTimeComparisonTypes).toEqual([]);
        });
    });

    describe("getSortConfig", () => {
        it("should be disabled without a viewBy attribute", async () => {
            const sortConfig = await createComponent().getSortConfig(
                referencePoint({ measures: [masterMeasureItems[0]] }),
            );

            expect(sortConfig.supported).toBe(true);
            expect(sortConfig.disabled).toBe(true);
            expect(sortConfig.availableSorts).toEqual([]);
        });

        it("should offer a viewBy sort (no area sort) when there is no stackBy", async () => {
            const sortConfig = await createComponent().getSortConfig(
                referencePoint({ measures: [masterMeasureItems[0]], view: [attributeItems[0]] }),
            );

            expect(sortConfig.disabled).toBe(false);
            expect(sortConfig.availableSorts).toHaveLength(1);
            expect(sortConfig.availableSorts[0].itemId.localIdentifier).toBe(
                attributeItems[0].localIdentifier,
            );
            expect(sortConfig.availableSorts[0].attributeSort!.areaSortEnabled).toBe(false);
            expect(sortConfig.availableSorts[0].metricSorts).toHaveLength(1);
        });

        it("should enable area sort and drop measure sorts when a stackBy attribute is present", async () => {
            const sortConfig = await createComponent().getSortConfig(
                referencePoint({
                    measures: [masterMeasureItems[0]],
                    view: [attributeItems[0]],
                    stack: [attributeItems[1]],
                }),
            );

            expect(sortConfig.availableSorts[0].attributeSort!.areaSortEnabled).toBe(true);
            expect(sortConfig.availableSorts[0].metricSorts).toBeUndefined();
        });
    });

    describe("renderVisualization and renderConfigurationPanel", () => {
        it("should mount on the element defined by the callback", () => {
            createComponent().update({ messages }, insightWithSingleMeasure, {}, executionFactory);

            // 1st call renders the chart, 2nd renders the config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
