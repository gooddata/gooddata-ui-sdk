// (C) 2024 GoodData Corporation

import noop from "lodash/noop.js";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { PluggableRepeater } from "../PluggableRepeater.js";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import { IVisConstruct } from "../../../../interfaces/Visualization.js";
import * as testMocks from "../../../../tests/mocks/testMocks.js";
import { getLastRenderEl } from "../../tests/testHelpers.js";
import { describe, it, expect, vi, afterEach } from "vitest";

describe("PluggableRepeater", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("project_id").execution();
    const defaultProps: IVisConstruct = {
        projectId: "project_id",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
        unmountFun: noop,
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

            visualization.update({}, testMocks.insightWithOneColumnAndOneAttribute, {}, executionFactory);

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
