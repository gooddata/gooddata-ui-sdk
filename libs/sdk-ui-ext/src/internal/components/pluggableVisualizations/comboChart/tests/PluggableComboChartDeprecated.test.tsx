// (C) 2019 GoodData Corporation
import noop from "lodash/noop";
import { PluggableComboChartDeprecated } from "../PluggableComboChartDeprecated";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

describe("PluggableComboChartDeprecated", () => {
    const defaultProps = {
        projectId: "PROJECTID",
        element: "body",
        configPanelElement: null as string,
        callbacks: {
            afterRender: noop,
            pushData: noop,
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: noop,
    };

    function createComponent(props = defaultProps) {
        return new PluggableComboChartDeprecated(props);
    }

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
});
