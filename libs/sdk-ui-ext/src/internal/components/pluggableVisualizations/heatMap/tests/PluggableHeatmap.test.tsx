// (C) 2019-2024 GoodData Corporation
import noop from "lodash/noop.js";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { IAttribute, IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";

import {
    expectedInsightDefDepartment,
    expectedInsightDefRegion,
    intersection,
    sourceInsightDef,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock.js";
import { PluggableHeatmap } from "../PluggableHeatmap.js";
import {
    createDrillDefinition,
    createDrillEvent,
    insightDefinitionToInsight,
    getLastRenderEl,
} from "../../tests/testHelpers.js";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks.js";
import { IBucketOfFun, IReferencePoint, IVisConstruct } from "../../../../interfaces/Visualization.js";
import * as testMocks from "../../../../tests/mocks/testMocks.js";
import { describe, it, expect, vi, afterEach } from "vitest";

const { Department, Region } = ReferenceMd;

describe("PluggableHeatmap", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
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

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    function createComponent(props = defaultProps) {
        return new PluggableHeatmap(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with one metric, category, stack and valid filters", async () => {
        const heatmap = createComponent();

        const extendedReferencePoint = await heatmap.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("heatmap should allow date attribute in column bucket", async () => {
        const heatmap = createComponent();

        const extendedReferencePoint = await heatmap.getExtendedReferencePoint(
            referencePointMocks.dateAttributeOnStackBucketReferencePoint,
        );

        expect(extendedReferencePoint).toMatchSnapshot();
    });

    it("heatmap should not support showInpercent", async () => {
        const heatmap = createComponent();
        const referencePoint: IReferencePoint = {
            ...referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            ...referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                                0,
                                1,
                            )[0],
                            showInPercent: true,
                        },
                    ],
                },
                {
                    localIdentifier: "view",
                    items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items.slice(
                        0,
                        1,
                    ),
                },
                {
                    localIdentifier: "stack",
                    items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items.slice(
                        1,
                        2,
                    ),
                },
            ],
        };

        const extendedReferencePoint: any = await heatmap.getExtendedReferencePoint(referencePoint);

        expect(extendedReferencePoint.buckets?.[0]?.items?.[0]?.[0]?.showInPercent).toBeFalsy();
    });

    describe("Arithmetic measures", () => {
        it("should skip measures that cannot be placed together with their operands", async () => {
            const heatmap = createComponent();
            const originalRefPoint =
                referencePointMocks.firstMeasureArithmeticAlongWithAttributeReferencePoint;

            const extendedReferencePoint = await heatmap.getExtendedReferencePoint(originalRefPoint);

            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: [originalRefPoint.buckets[0].items[1]],
                },
                {
                    localIdentifier: "view",
                    items: originalRefPoint.buckets[1].items,
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ];
            expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
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

        it("should remove all derived measures and arithmetic measures created from derived measures", async () => {
            const component = createComponent();

            const extendedReferencePoint = await component.getExtendedReferencePoint(
                referencePointMocks.mixOfMeasuresWithDerivedAndArithmeticFromDerivedHeatMapReferencePoint,
            );
            expect(extendedReferencePoint.buckets).toEqual([
                {
                    localIdentifier: "measures",
                    items: [referencePointMocks.masterMeasureItems[0]],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
                {
                    localIdentifier: "stack",
                    items: [],
                },
            ]);
        });
    });

    describe("Drill Down", () => {
        it.each([
            [
                "on column attribute",
                sourceInsightDef,
                Region.Default,
                targetUri,
                intersection,
                expectedInsightDefRegion,
            ],
            [
                "on row attribute",
                sourceInsightDef,
                Department.Default,
                targetUri,
                intersection,
                expectedInsightDefDepartment,
            ],
        ])(
            "%s should replace the drill down attribute and add intersection filters",
            (
                _testName: string,
                sourceInsightDefinition: IInsightDefinition,
                drillSourceAttribute: IAttribute,
                drillTargetUri: string,
                drillIntersection: IDrillEventIntersectionElement[],
                expectedInsightDefinition: IInsightDefinition,
            ) => {
                const chart = createComponent();
                const drillDefinition = createDrillDefinition(drillSourceAttribute, drillTargetUri);
                const sourceInsight = insightDefinitionToInsight(sourceInsightDefinition, "first", "first");
                const expectedInsight = insightDefinitionToInsight(
                    expectedInsightDefinition,
                    "first",
                    "first",
                );

                const result: IInsight = chart.getInsightWithDrillDownApplied(
                    sourceInsight,
                    {
                        drillDefinition,
                        event: createDrillEvent("treemap", drillIntersection),
                    },
                    true,
                );

                expect(result).toEqual(expectedInsight);
            },
        );
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

        it("should provide attribute normal as default sort, attribute normal and measuree sorts as available sorts for 1M + 1VB", async () => {
            const chart = createComponent(defaultProps);
            const sortConfig = await chart.getSortConfig(referencePointMocks.oneMetricOneCategory);

            expect(sortConfig).toMatchSnapshot();
        });

        it("should provide attribute normal as default sort, attribute area sort as available sorts for 1M + 1SB", async () => {
            const chart = createComponent(defaultProps);
            const sortConfig = await chart.getSortConfig(referencePointMocks.oneMetricOneStackReferencePoint);

            expect(sortConfig).toMatchSnapshot();
        });

        it("should provide attribute normal as default sort, attribute are sorts as available sorts for 1M + 1VB + 1SB", async () => {
            const chart = createComponent(defaultProps);
            const sortConfig = await chart.getSortConfig(
                referencePointMocks.oneMetricAndCategoryAndStackReferencePoint,
            );

            expect(sortConfig).toMatchSnapshot();
        });
    });

    describe("PluggableHeatmap renderVisualization and renderConfigurationPanel", () => {
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
