// (C) 2019-2025 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IDrillableItem } from "@gooddata/sdk-ui";
import { CoreXirr, ICoreChartProps } from "@gooddata/sdk-ui-charts";

import { IVisConstruct, IVisProps } from "../../../../interfaces/Visualization.js";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import * as testMocks from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { getLastRenderEl } from "../../tests/testHelpers.js";
import { PluggableXirr } from "../PluggableXirr.js";

describe("PluggableXirr", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps: IVisConstruct = {
        projectId: "PROJECTID",
        backend: dummyBackend(),
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        visualizationProperties: {},
        callbacks: {
            afterRender: vi.fn(),
            pushData: vi.fn(),
            onLoadingChanged: vi.fn(),
            onError: vi.fn(),
        },
        renderFun: mockRenderFun,
        unmountFun: vi.fn(),
        messages,
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
            const pushData = vi.fn();

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
                messages,
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

            visualization.update({ messages }, testMocks.insightWithSingleMeasure, {}, executionFactory);

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
