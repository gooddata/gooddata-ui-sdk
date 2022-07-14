// (C) 2019-2022 GoodData Corporation
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { PluggableXirr } from "../PluggableXirr";
import { IVisConstruct, IVisProps } from "../../../../interfaces/Visualization";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as testMocks from "../../../../tests/mocks/testMocks";
import { IDrillableItem } from "@gooddata/sdk-ui";
import { CoreXirr, ICoreChartProps } from "@gooddata/sdk-ui-charts";
import { getLastRenderEl } from "../../tests/testHelpers";

describe("PluggableXirr", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = jest.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        backend: dummyBackend(),
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        visualizationProperties: {},
        callbacks: {
            afterRender: jest.fn(),
            pushData: jest.fn(),
            onLoadingChanged: jest.fn(),
            onError: jest.fn(),
        },
        renderFun: mockRenderFun,
    };

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    function createComponent(customProps: Partial<IVisConstruct> = {}) {
        return new PluggableXirr({
            ...defaultProps,
            ...customProps,
        });
    }

    describe("init", () => {
        it("should not call pushData during init", () => {
            const pushData = jest.fn();

            createComponent({
                callbacks: {
                    pushData,
                },
            });

            expect(pushData).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        const emptyPropertiesMeta = {};

        function getTestOptions(): IVisProps {
            const drillableItems: IDrillableItem[] = [];
            return {
                dimensions: {
                    width: 12,
                    height: 14,
                },
                custom: {
                    drillableItems,
                },
                locale: "en-US",
            };
        }

        it("should not render xirr when dataSource is missing", () => {
            const xirr = createComponent();
            const options: IVisProps = getTestOptions();

            xirr.update({ ...options }, testMocks.emptyInsight, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl(mockRenderFun, mockElement);
            expect(renderEl).toBeUndefined();
        });

        it("should render XIRR by react to given element passing down properties", () => {
            const xirr = createComponent({
                ...defaultProps,
                renderFun: mockRenderFun,
                featureFlags: { enableKDWidgetCustomHeight: false },
            });
            const options: IVisProps = getTestOptions();

            xirr.update(options, testMocks.insightWithSingleMeasure, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl<ICoreChartProps>(mockRenderFun, mockElement);
            expect(renderEl.type).toBe(CoreXirr);
            expect(renderEl.props.config.enableCompactSize).toBeUndefined();
        });

        it("should render XIRR by react to given element passing down properties when FF enableKDWidgetCustomHeight is set to true", () => {
            const xirr = createComponent({
                ...defaultProps,
                renderFun: mockRenderFun,
                featureFlags: { enableKDWidgetCustomHeight: true },
            });
            const options: IVisProps = getTestOptions();

            xirr.update(options, testMocks.insightWithSingleMeasure, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl<ICoreChartProps>(mockRenderFun, mockElement);
            expect(renderEl.type).toBe(CoreXirr);
            expect(renderEl.props.config.enableCompactSize).toBe(true);
        });

        it("should correctly set config.disableDrillUnderline from FeatureFlag disableKpiDashboardHeadlineUnderline", () => {
            const xirr = createComponent({
                featureFlags: {
                    disableKpiDashboardHeadlineUnderline: true,
                },
                renderFun: mockRenderFun,
            });

            const options: IVisProps = getTestOptions();

            xirr.update(options, testMocks.insightWithSingleMeasure, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl<ICoreChartProps>(mockRenderFun, mockElement);
            expect(renderEl.type).toBe(CoreXirr);
            expect(renderEl.props.config.disableDrillUnderline).toBe(true);
        });
    });

    describe("getExtendedReferencePoint", () => {
        it("should return proper extended reference point", async () => {
            const extendedReferencePoint = await createComponent().getExtendedReferencePoint(
                referencePointMocks.measuresAndDateReferencePoint,
            );

            expect(extendedReferencePoint).toMatchSnapshot();
        });

        it("should correctly process empty reference point", async () => {
            const headline = createComponent();

            const extendedReferencePoint = await headline.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint).toMatchSnapshot();
        });
    });

    describe("PluggableXirr renderVisualization and renderConfigurationPanel", () => {
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
