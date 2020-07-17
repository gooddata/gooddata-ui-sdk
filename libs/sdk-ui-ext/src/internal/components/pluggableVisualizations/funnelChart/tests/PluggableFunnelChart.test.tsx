// (C) 2019 GoodData Corporation
import noop from "lodash/noop";
import { PluggableFunnelChart } from "../PluggableFunnelChart";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../tests/mocks/uiConfigMocks";

import { IBucketOfFun, IFilters } from "../../../../interfaces/Visualization";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

describe("PluggableFunnelChart", () => {
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
        return new PluggableFunnelChart(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    it("should return reference point with only one metric and one category and only valid filters", async () => {
        const funnelChart = createComponent();

        const extendedReferencePoint = await funnelChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
        );

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
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters.items.slice(0, 1),
        };
        const expectedProperties = {};
        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: {
                ...uiConfigMocks.multipleMetricsAndCategoriesPieUiConfig,
                openAsReport: {
                    supported: false,
                },
            },
            properties: expectedProperties,
        });
    });

    it("should return reference point with multiple metrics and no category", async () => {
        const funnelChart = createComponent();

        const extendedReferencePoint = await funnelChart.getExtendedReferencePoint(
            referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
        );

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: [],
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: [],
        };
        const expectedProperties = {};
        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            uiConfig: {
                ...uiConfigMocks.multipleMetricsNoCategoriesPieUiConfig,
                openAsReport: {
                    supported: false,
                },
            },
            properties: expectedProperties,
        });
    });

    it("should return reference point with one metric and no category", async () => {
        const funnelChart = createComponent();

        const expectedBuckets: IBucketOfFun[] = [
            {
                localIdentifier: "measures",
                items: referencePointMocks.oneMetricNoCategoriesReferencePoint.buckets[0].items,
            },
            {
                localIdentifier: "view",
                items: [],
            },
        ];
        const expectedFilters: IFilters = {
            localIdentifier: "filters",
            items: referencePointMocks.oneMetricNoCategoriesReferencePoint.filters.items,
        };

        const extendedReferencePoint = await funnelChart.getExtendedReferencePoint(
            referencePointMocks.oneMetricNoCategoriesReferencePoint,
        );

        expect(extendedReferencePoint).toEqual({
            buckets: expectedBuckets,
            filters: expectedFilters,
            properties: {},
            uiConfig: {
                ...uiConfigMocks.oneMetricNoCategoriesPieUiConfig,
                openAsReport: {
                    supported: false,
                },
            },
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
