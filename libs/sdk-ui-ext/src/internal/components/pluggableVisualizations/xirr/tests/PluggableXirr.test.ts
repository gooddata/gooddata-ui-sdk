// (C) 2019-2022 GoodData Corporation
import React from "react";
import ReactDom from "react-dom";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { PluggableXirr } from "../PluggableXirr";
import { IVisConstruct, IVisProps } from "../../../../interfaces/Visualization";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as testMocks from "../../../../tests/mocks/testMocks";
import { IDrillableItem } from "@gooddata/sdk-ui";
import { CoreXirr } from "@gooddata/sdk-ui-charts";

describe("PluggableXirr", () => {
    const defaultProps = {
        projectId: "PROJECTID",
        backend: dummyBackend(),
        element: "body",
        configPanelElement: "invalid",
        visualizationProperties: {},
        callbacks: {
            afterRender: jest.fn(),
            pushData: jest.fn(),
            onLoadingChanged: jest.fn(),
            onError: jest.fn(),
        },
        renderFun: jest.fn(),
    };

    const executionFactory = dummyBackend().workspace("PROJECTID").execution();

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
            const fakeElement: any = "fake element";
            const reactCreateElementSpy = jest
                .spyOn(React, "createElement")
                .mockImplementation(() => fakeElement);
            const reactRenderSpy = jest.spyOn(ReactDom, "render").mockImplementation(jest.fn());

            const xirr = createComponent();
            const options: IVisProps = getTestOptions();

            xirr.update({ ...options }, testMocks.emptyInsight, emptyPropertiesMeta, executionFactory);

            expect(reactRenderSpy).toHaveBeenCalledTimes(0);

            reactCreateElementSpy.mockReset();
            reactRenderSpy.mockReset();
        });

        it("should render XIRR by react to given element passing down properties", () => {
            const fakeElement: any = "fake element";
            const reactCreateElementSpy = jest
                .spyOn(React, "createElement")
                .mockImplementation(() => fakeElement);
            const mockRenderFun = jest.fn();

            const xirr = createComponent({
                ...defaultProps,
                renderFun: mockRenderFun,
                featureFlags: { enableKDWidgetCustomHeight: false },
            });
            const options: IVisProps = getTestOptions();

            xirr.update(options, testMocks.insightWithSingleMeasure, emptyPropertiesMeta, executionFactory);

            expect(reactCreateElementSpy.mock.calls[0][0]).toBe(CoreXirr);
            expect(mockRenderFun).toHaveBeenCalledWith(
                fakeElement,
                document.querySelector(defaultProps.element),
            );

            reactCreateElementSpy.mockReset();
        });

        it("should render XIRR by react to given element passing down properties when FF enableKDWidgetCustomHeight is set to true", () => {
            const fakeElement: any = "fake element";
            const reactCreateElementSpy = jest
                .spyOn(React, "createElement")
                .mockImplementation(() => fakeElement);
            const mockRenderFun = jest.fn();

            const xirr = createComponent({
                ...defaultProps,
                renderFun: mockRenderFun,
                featureFlags: { enableKDWidgetCustomHeight: true },
            });
            const options: IVisProps = getTestOptions();

            xirr.update(options, testMocks.insightWithSingleMeasure, emptyPropertiesMeta, executionFactory);

            expect(reactCreateElementSpy.mock.calls[0][0]).toBe(CoreXirr);
            expect(mockRenderFun).toHaveBeenCalledWith(
                fakeElement,
                document.querySelector(defaultProps.element),
            );

            reactCreateElementSpy.mockReset();
        });

        it("should correctly set config.disableDrillUnderline from FeatureFlag disableKpiDashboardHeadlineUnderline", () => {
            const fakeElement: any = "fake element";
            const reactCreateElementSpy = jest
                .spyOn(React, "createElement")
                .mockImplementation(() => fakeElement);
            const mockRenderFun = jest.fn();

            const xirr = createComponent({
                featureFlags: {
                    disableKpiDashboardHeadlineUnderline: true,
                },
                renderFun: mockRenderFun,
            });

            const options: IVisProps = getTestOptions();

            xirr.update(options, testMocks.insightWithSingleMeasure, emptyPropertiesMeta, executionFactory);

            expect(reactCreateElementSpy.mock.calls[0][0]).toBe(CoreXirr);

            reactCreateElementSpy.mockReset();
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
});
