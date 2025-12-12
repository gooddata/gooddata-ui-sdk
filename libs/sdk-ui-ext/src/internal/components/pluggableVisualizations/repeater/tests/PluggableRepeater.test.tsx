// (C) 2024-2025 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { type IVisConstruct } from "../../../../interfaces/Visualization.js";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import * as testMocks from "../../../../tests/mocks/testMocks.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../../utils/translations.js";
import { getLastRenderEl } from "../../tests/testHelpers.js";
import { PluggableRepeater } from "../PluggableRepeater.js";

describe("PluggableRepeater", () => {
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
        unmountFun: () => {},
        messages,
    };

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    function createComponent(props = defaultProps) {
        return new PluggableRepeater(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with one attribute, columns and valid filters", async () => {
        const repeater = createComponent();
        const extendedReferencePoint = await repeater.getExtendedReferencePoint(
            referencePointMocks.attributeAndColumnsReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("should reuse one attribute and measures", async () => {
        const repeater = createComponent();
        const extendedReferencePoint = await repeater.getExtendedReferencePoint(
            referencePointMocks.attributesAndColumnsReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("repeater should not allow date attributes or different attribute than main attribute in columns bucket", async () => {
        const repeater = createComponent();
        const extendedReferencePoint = await repeater.getExtendedReferencePoint(
            referencePointMocks.attributesAndColumnsWithDatesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    describe("PluggableRepeater renderVisualization and renderConfigurationPanel", () => {
        it("should mount on the element defined by the callback", () => {
            const visualization = createComponent();

            visualization.update(
                { messages },
                testMocks.insightWithOneColumnAndOneAttribute,
                {},
                executionFactory,
            );

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
