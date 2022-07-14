// (C) 2019-2022 GoodData Corporation
import noop from "lodash/noop";
import { PluggableComboChartDeprecated } from "../PluggableComboChartDeprecated";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IVisConstruct } from "../../../../interfaces/Visualization";
import { getLastRenderEl } from "../../tests/testHelpers";
import * as testMocks from "../../../../tests/mocks/testMocks";

describe("PluggableComboChartDeprecated", () => {
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
        return new PluggableComboChartDeprecated(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    describe("Arithmetic measures", () => {
        it("should place arithmetic measure into primary measures bucket and it's operands into secondary measures bucket", async () => {
            const combo = createComponent();

            const extendedReferencePoint = await combo.getExtendedReferencePoint(
                referencePointMocks.firstMeasureArithmeticNoAttributeReferencePoint,
            );

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.arithmeticMeasureItems[0]],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [
                        referencePointMocks.masterMeasureItems[0],
                        referencePointMocks.masterMeasureItems[1],
                    ],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });

        it("should place arithmetic measure with it's operands into primary measures bucket when there is already an empty secondary measures bucket", async () => {
            const combo = createComponent();

            const extendedReferencePoint = await combo.getExtendedReferencePoint({
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            referencePointMocks.arithmeticMeasureItems[0],
                            referencePointMocks.masterMeasureItems[0],
                            referencePointMocks.masterMeasureItems[1],
                        ],
                    },
                    {
                        localIdentifier: "secondary_measures",
                        items: [],
                    },
                ],
                filters: {
                    localIdentifier: "filters",
                    items: [referencePointMocks.overTimeComparisonDateItem],
                },
            });

            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [
                        referencePointMocks.arithmeticMeasureItems[0],
                        referencePointMocks.masterMeasureItems[0],
                        referencePointMocks.masterMeasureItems[1],
                    ],
                },
                {
                    localIdentifier: "secondary_measures",
                    items: [],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
        });
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

            visualization.update({}, testMocks.insightWithSingleMeasure, {}, executionFactory);

            // 1st call for rendering element
            // 2nd call for rendering config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
