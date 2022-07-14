// (C) 2019-2022 GoodData Corporation
import noop from "lodash/noop";
import { PluggableFunnelChart } from "../PluggableFunnelChart";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IVisConstruct } from "../../../../interfaces/Visualization";
import * as testMocks from "../../../../tests/mocks/testMocks";

describe("PluggableFunnelChart", () => {
    const execution = dummyBackend().workspace("PROJECTID").execution();
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = jest.fn();
    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
    };

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    function createComponent(props = defaultProps) {
        return new PluggableFunnelChart(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with only one metric and one category and only valid filters", async () => {
        const funnelChart = createComponent();

        const extendedReferencePoint = await funnelChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with multiple metrics and no category", async () => {
        const funnelChart = createComponent();

        const extendedReferencePoint = await funnelChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should return reference point with one metric and no category", async () => {
        const funnelChart = createComponent();
        const extendedReferencePoint = await funnelChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with no supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([]);
        });
    });

    describe("`renderVisualization` and `renderConfigurationPanel`", () => {
        it("should mount on the element defined by the callback", () => {
            const visualization = createComponent();

            visualization.update({}, testMocks.insightWithSingleMeasure, {}, execution);

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(mockRenderFun.mock.calls[0][1]).toEqual(mockElement);
            expect(mockRenderFun.mock.calls[1][1]).toEqual(mockConfigElement);
        });
    });
});
