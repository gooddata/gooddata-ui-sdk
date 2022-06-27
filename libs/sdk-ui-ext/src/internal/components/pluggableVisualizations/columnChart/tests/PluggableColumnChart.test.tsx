// (C) 2019-2022 GoodData Corporation
import noop from "lodash/noop";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { PluggableColumnChart } from "../PluggableColumnChart";

import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import { AXIS } from "../../../../constants/axis";
import { IVisConstruct } from "../../../../interfaces/Visualization";
import * as testMocks from "../../../../tests/mocks/testMocks";
import { getLastRenderEl } from "../../tests/testHelpers";

describe("PluggableColumnChart", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = jest.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
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

    function createComponent(props = defaultProps) {
        return new PluggableColumnChart(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should send only supported properties and supported properties list via pushData callback", () => {
        const pushData = jest.fn();
        const callbacks = {
            ...defaultProps.callbacks,
            pushData,
        };

        const visualizationProperties = {
            controls: {
                yaxis: {
                    rotation: "60",
                },
                xaxis: {
                    labelsEnabled: false,
                },
                legend: {
                    position: "left",
                    enabled: false,
                },
                unsupported: {
                    foo: "bar",
                },
            },
        };

        const props = {
            ...defaultProps,
            callbacks,
            visualizationProperties,
        };

        const expectedSupportedProperties = {
            controls: {
                yaxis: {
                    rotation: "60",
                },
                xaxis: {
                    labelsEnabled: false,
                },
                legend: {
                    position: "left",
                    enabled: false,
                },
            },
        };

        const initialProperties = {
            supportedProperties: expectedSupportedProperties,
        };

        createComponent(props);

        expect(pushData).toBeCalledWith({ initialProperties }, undefined);
    });

    describe("Over Time Comparison", () => {
        it("should return reference point containing uiConfig with PP, SP supported comparison types", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([
                OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                OverTimeComparisonTypes.PREVIOUS_PERIOD,
            ]);
        });
    });

    describe("Dual Axes", () => {
        it("should NOT add measure identifier into properties which are NOT set to secondary axis", async () => {
            const chart = createComponent(defaultProps);

            const extendedReferencePoint = await chart.getExtendedReferencePoint(
                referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
            );

            const measures = extendedReferencePoint?.properties?.controls?.secondary_yaxis.measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
            expect(measures).toBeUndefined();
            expect(axis).toBeUndefined();
        });

        it("should add measures identifiers into properties which are set to secondary axis", async () => {
            const chart = createComponent(defaultProps);

            const extendedReferencePoint = await chart.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            );

            const measures = extendedReferencePoint?.properties?.controls?.secondary_yaxis?.measures;
            const axis = extendedReferencePoint?.uiConfig?.axis;
            expect(measures).toEqual(["m3", "m4"]);
            expect(axis).toEqual(AXIS.DUAL);
        });
    });

    describe("Sort config", () => {
        it("should create sort config with sorting supported but disabled when there is no view by attribute", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.oneMetricNoCategoriesReferencePoint,
            );

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should create sort config with sorting disabled when there is no measure", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(referencePointMocks.justViewByReferencePoint);

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeTruthy();
        });

        it("should create sort config with sorting enabled when there is view by attribute", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
            );

            expect(sortConfig.supported).toBeTruthy();
            expect(sortConfig.disabled).toBeFalsy();
        });

        it("should provide attribute normal sort as default sort, attribute normal and measure sort as available sorts for 1M + 1VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(referencePointMocks.oneMetricOneCategory);

            expect(sortConfig).toMatchSnapshot();
        });

        it("should provide attribute normal sorts as default sort, two attribute normal, one area sort and one measure sort as available sort for 1M + 2 VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.oneMetricAndTwoCategoriesReferencePoint,
            );
            expect(sortConfig).toMatchSnapshot();
        });

        it("should provide attribute normal sort as default sort, attribute normal and attribute area available sorts for 1M + 1VB + 1SB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.simpleStackedWithoutPropertiesReferencePoint,
            );

            expect(sortConfig).toMatchSnapshot();
        });

        it("should provide attribute normal sort as default sort, attribute normal and attribute area available sorts for 1M + 2VB + 1SB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.oneMetricAndManyCategoriesAndOneStackRefPoint,
            );

            expect(sortConfig).toMatchSnapshot();
        });

        it("should provide attribute normal sort as default sort, attribute area and measure sort as available sorts for 2M + 1VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(referencePointMocks.twoMetricAndOneCategoryRefPoint);
            expect(sortConfig).toMatchSnapshot();
        });

        it("should provide attribute normal sort as default sort, one attribute area and two measure sorts as available sorts for 2 stacked M + 1VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.twoStackedMetricAndOneCategoryRefPoint,
            );

            expect(sortConfig).toMatchSnapshot();
        });

        it("should provide two attribute normal sorts as default sort, two attribute area and one measure sorts as available sorts for 2M + 2VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.twoMetricAndTwoCategoriesRefPoint,
            );

            expect(sortConfig).toMatchSnapshot();
        });

        it("should provide two attribute normal sorts as default sort, two attribute area and one measure sorts as available sorts for 2 stacked M + 2VB", async () => {
            const chart = createComponent(defaultProps);

            const sortConfig = await chart.getSortConfig(
                referencePointMocks.twoStackedMetricAndTwoCategoriesRefPoint,
            );

            expect(sortConfig).toMatchSnapshot();
        });
    });

    describe("`renderVisualization` and `renderConfigurationPanel`", () => {
        it("should mount on the element defined by the callback", () => {
            const visualization = createComponent();

            visualization.update({}, testMocks.insightWithSingleMeasure, {}, executionFactory);

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
