// (C) 2019-2022 GoodData Corporation
import noop from "lodash/noop";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";
import { IAttribute, IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { Department, Region } from "@gooddata/reference-workspace/dist/md/full";

import {
    expectedInsightDefDepartment,
    expectedInsightDefRegion,
    intersection,
    sourceInsightDef,
    targetUri,
} from "./getInsightWithDrillDownAppliedMock";
import { PluggableHeatmap } from "../PluggableHeatmap";
import { createDrillDefinition, createDrillEvent, insightDefinitionToInsight } from "../../tests/testHelpers";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../tests/mocks/uiConfigMocks";
import { IBucketOfFun, IFilters, IReferencePoint } from "../../../../interfaces/Visualization";

describe("PluggableHeatmap", () => {
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
        return new PluggableHeatmap(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with one metric, category, stack and valid filters", async () => {
        const heatmap = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items.slice(
                    0,
                    1,
                ),
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
        ];
        const expectedProperties = {};
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters.items.slice(0, 2),
        };

        const extendedReferencePoint = await heatmap.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: uiConfigMocks.defaultHeatmapUiConfig,
            properties: expectedProperties,
        });
    });

    it("heatmap should allow date attribute in column bucket", async () => {
        const heatmap = createComponent();
        const referencePoint = referencePointMocks.dateAttributeOnStackBucketReferencePoint;

        const extendedReferencePoint = await heatmap.getExtendedReferencePoint(
            referencePointMocks.dateAttributeOnStackBucketReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: referencePoint.buckets,
            filters: referencePoint.filters,
            uiConfig: uiConfigMocks.defaultHeatmapUiConfig,
            properties: {},
        });
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

        const extendedReferencePoint = await heatmap.getExtendedReferencePoint(referencePoint);

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
                Region,
                targetUri,
                intersection,
                expectedInsightDefRegion,
            ],
            [
                "on row attribute",
                sourceInsightDef,
                Department,
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

                const result: IInsight = chart.getInsightWithDrillDownApplied(sourceInsight, {
                    drillDefinition,
                    event: createDrillEvent("treemap", drillIntersection),
                });

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
});
