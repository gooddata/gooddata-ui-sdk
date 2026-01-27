// (C) 2019-2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { type IBucketOfFun, type IVisConstruct } from "../../../../interfaces/Visualization.js";
import {
    dateAttributeOnStackBucketReferencePoint,
    emptyReferencePoint,
    firstMeasureArithmeticAlongWithAttributeReferencePoint,
    masterMeasureItems,
    metricAndAttributeFromAndTo,
    mixOfMeasuresWithDerivedAndArithmeticFromDerivedHeatMapReferencePoint,
    multipleMetricsAndCategoriesReferencePoint,
} from "../../../../tests/mocks/referencePointMocks.js";
import { insightWithSingleMeasure } from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { getLastRenderEl } from "../../tests/pluggableVisualizations.test.helpers.js";
import { PluggableSankeyChart } from "../PluggableSankeyChart.js";

describe("PluggableSankeyChart", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("project_id").execution();
    const defaultProps: IVisConstruct = {
        projectId: "project_id",
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
    } as unknown as IVisConstruct;

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    function createComponent(props = defaultProps) {
        return new PluggableSankeyChart(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with one metric, attributeFrom, attributeTo and valid filters", async () => {
        const sankey = createComponent();
        const extendedReferencePoint = await sankey.getExtendedReferencePoint(metricAndAttributeFromAndTo);

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should reuse one measure and order attribute types", async () => {
        const sankey = createComponent();
        const extendedReferencePoint = await sankey.getExtendedReferencePoint(
            multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("sankey should allow date attribute in attribute (from/to)", async () => {
        const sankey = createComponent();
        const extendedReferencePoint = await sankey.getExtendedReferencePoint(
            dateAttributeOnStackBucketReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("Arithmetic measures", () => {
        it("should skip measures that cannot be placed together with their operands", async () => {
            const sankey = createComponent();
            const originalRefPoint = firstMeasureArithmeticAlongWithAttributeReferencePoint;

            const extendedReferencePoint = await sankey.getExtendedReferencePoint(originalRefPoint);

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [originalRefPoint.buckets[0].items[1]],
                },
                {
                    localIdentifier: "attribute_from",
                    items: originalRefPoint.buckets[1].items,
                },
                {
                    localIdentifier: "attribute_to",
                    items: [],
                },
            ];
            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
        });
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with no supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(emptyReferencePoint);

            expect(extendedReferencePoint.uiConfig!.supportedOverTimeComparisonTypes).toEqual([]);
        });

        it("should remove all derived measures and arithmetic measures created from derived measures", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                mixOfMeasuresWithDerivedAndArithmeticFromDerivedHeatMapReferencePoint,
            );
            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [masterMeasureItems[0]],
                },
                {
                    localIdentifier: "attribute_from",
                    items: [],
                },
                {
                    localIdentifier: "attribute_to",
                    items: [],
                },
            ]);
        });
    });

    describe("PluggableSankeyChart renderVisualization and renderConfigurationPanel", () => {
        it("should mount on the element defined by the callback", () => {
            const visualization = createComponent();

            visualization.update({ messages }, insightWithSingleMeasure, {}, executionFactory);

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
