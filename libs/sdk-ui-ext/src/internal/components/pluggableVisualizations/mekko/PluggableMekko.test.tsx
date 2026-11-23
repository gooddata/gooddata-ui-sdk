// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IInsightDefinition,
    type ISortItem,
    isMeasureLocator,
    newAttributeAreaSort,
    newAttributeSort,
    newMeasureSort,
} from "@gooddata/sdk-model";
import { type ICoreChartProps } from "@gooddata/sdk-ui-charts";

import { type IReferencePoint, type IVisConstruct } from "../../../interfaces/Visualization.js";
import {
    attributeItems,
    derivedMeasureItems,
    emptyReferencePoint,
    masterMeasureItems,
} from "../../../tests/referencePointMocks.test.helpers.js";
import {
    insightWithSingleMeasure,
    insightWithSingleMeasureAndViewBy,
    insightWithSingleMeasureAndViewByAndStack,
} from "../../../tests/testMocks.test.helpers.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../../utils/translations.js";
import { getLastRenderEl } from "../pluggableVisualizations.test.helpers.js";

import { PluggableMekko } from "./PluggableMekko.js";

const emptyFilters = { localIdentifier: "filters", items: [] as any[] };

// Build a Mekko-shaped reference point: Width -> measures, Height -> secondary_measures,
// viewBy -> view, stackBy -> stack.
function referencePoint(buckets: {
    measures?: any[];
    secondaryMeasures?: any[];
    view?: any[];
    stack?: any[];
}): IReferencePoint {
    return {
        buckets: [
            { localIdentifier: "measures", items: buckets.measures ?? [] },
            { localIdentifier: "secondary_measures", items: buckets.secondaryMeasures ?? [] },
            { localIdentifier: "view", items: buckets.view ?? [] },
            { localIdentifier: "stack", items: buckets.stack ?? [] },
        ],
        filters: emptyFilters,
    } as unknown as IReferencePoint;
}

describe("PluggableMekko", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = vi.fn();
    const executionFactory = dummyBackend().workspace("PROJECTID").execution();
    const defaultProps = {
        projectId: "PROJECTID",
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        callbacks: {
            afterRender: () => {},
            pushData: () => {},
        },
        backend: dummyBackend(),
        visualizationProperties: {},
        renderFun: mockRenderFun,
        messages,
    };

    function createComponent(props = defaultProps) {
        return new PluggableMekko(props as unknown as IVisConstruct);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        expect(createComponent()).toBeTruthy();
    });

    describe("getExtendedReferencePoint - bucket transforms", () => {
        it("should split two measures into Width (measures) + Height (secondary_measures) and place viewBy/stackBy", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({
                    measures: [masterMeasureItems[0], masterMeasureItems[1]],
                    view: [attributeItems[0]],
                    stack: [attributeItems[1]],
                }),
            );

            expect(extended).toMatchSnapshot();
        });

        it("should keep a single measure as Width only, with empty Height/stack", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({ measures: [masterMeasureItems[0]], view: [attributeItems[0]] }),
            );

            expect(extended).toMatchSnapshot();
        });

        it("should cap at two measures (Width + Height) and one viewBy / one stackBy", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({
                    measures: [masterMeasureItems[0], masterMeasureItems[1], masterMeasureItems[2]],
                    view: [attributeItems[0], attributeItems[1]],
                    stack: [attributeItems[2]],
                }),
            );

            expect(extended).toMatchSnapshot();
        });

        it("should remove derived measures", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({ measures: [masterMeasureItems[0], derivedMeasureItems[0]] }),
            );

            expect(extended).toMatchSnapshot();
        });
    });

    describe("uiConfig", () => {
        it("should enable optional stacking (for the Stack to 100% control)", async () => {
            const extended = await createComponent().getExtendedReferencePoint(emptyReferencePoint);
            expect(extended.uiConfig!.optionalStacking).toEqual({
                supported: true,
                stackMeasures: false,
                stackToPercentVisible: false,
            });
        });

        it("should not support over-time comparison", async () => {
            const extended = await createComponent().getExtendedReferencePoint(emptyReferencePoint);
            expect(extended.uiConfig!.supportedOverTimeComparisonTypes).toEqual([]);
        });

        it("should lock Stack to 100% (uiConfig only) when only Width and Stack By are filled", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({
                    measures: [masterMeasureItems[0]],
                    view: [attributeItems[0]],
                    stack: [attributeItems[1]],
                }),
            );

            expect(extended.uiConfig!.optionalStacking!.disabled).toBe(true);
            expect(extended.uiConfig!.optionalStacking!.stackMeasuresToPercent).toBe(true);
            expect(extended.properties?.controls?.["stackMeasuresToPercent"]).toBeUndefined();
        });

        it("should not lock Stack to 100% once the Height measure is present", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({
                    measures: [masterMeasureItems[0], masterMeasureItems[1]],
                    view: [attributeItems[0]],
                    stack: [attributeItems[1]],
                }),
            );

            expect(extended.uiConfig!.optionalStacking!.disabled).toBeUndefined();
            expect(extended.uiConfig!.optionalStacking!.stackMeasuresToPercent).toBeUndefined();
            expect(extended.properties?.controls?.["stackMeasuresToPercent"]).toBeUndefined();
        });

        it("should not lock Stack to 100% without a Stack By attribute", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({ measures: [masterMeasureItems[0]], view: [attributeItems[0]] }),
            );

            expect(extended.uiConfig!.optionalStacking!.disabled).toBeUndefined();
            expect(extended.uiConfig!.optionalStacking!.stackMeasuresToPercent).toBeUndefined();
            expect(extended.properties?.controls?.["stackMeasuresToPercent"]).toBeUndefined();
        });

        it("should declare Stack to 100% visible for a Height-only metric with Stack By", async () => {
            const extended = await createComponent().getExtendedReferencePoint(
                referencePoint({
                    secondaryMeasures: [masterMeasureItems[0]],
                    view: [attributeItems[0]],
                    stack: [attributeItems[1]],
                }),
            );

            expect(extended.uiConfig!.optionalStacking!.stackToPercentVisible).toBe(true);
            expect(extended.uiConfig!.optionalStacking!.disabled).toBeUndefined();
            expect(extended.uiConfig!.optionalStacking!.stackMeasuresToPercent).toBeUndefined();
        });

        it("should declare Stack to 100% visible for Width-only and for Width + Height with Stack By", async () => {
            const widthOnly = await createComponent().getExtendedReferencePoint(
                referencePoint({ measures: [masterMeasureItems[0]], stack: [attributeItems[1]] }),
            );
            const both = await createComponent().getExtendedReferencePoint(
                referencePoint({
                    measures: [masterMeasureItems[0]],
                    secondaryMeasures: [masterMeasureItems[1]],
                    stack: [attributeItems[1]],
                }),
            );

            expect(widthOnly.uiConfig!.optionalStacking!.stackToPercentVisible).toBe(true);
            expect(both.uiConfig!.optionalStacking!.stackToPercentVisible).toBe(true);
        });

        it("should declare Stack to 100% hidden without a Stack By attribute or without any metric", async () => {
            const noStack = await createComponent().getExtendedReferencePoint(
                referencePoint({ secondaryMeasures: [masterMeasureItems[0]], view: [attributeItems[0]] }),
            );
            const noMetric = await createComponent().getExtendedReferencePoint(
                referencePoint({ view: [attributeItems[0]], stack: [attributeItems[1]] }),
            );

            expect(noStack.uiConfig!.optionalStacking!.stackToPercentVisible).toBe(false);
            expect(noMetric.uiConfig!.optionalStacking!.stackToPercentVisible).toBe(false);
        });
    });

    describe("getSortConfig", () => {
        const singleMetricStacked = referencePoint({
            measures: [masterMeasureItems[0]],
            view: [attributeItems[0]],
            stack: [attributeItems[1]],
        });
        const bothMetricsStacked = referencePoint({
            measures: [masterMeasureItems[0]],
            secondaryMeasures: [masterMeasureItems[1]],
            view: [attributeItems[0]],
            stack: [attributeItems[1]],
        });

        it("should be disabled without a viewBy attribute", async () => {
            const sortConfig = await createComponent().getSortConfig(
                referencePoint({ measures: [masterMeasureItems[0]] }),
            );

            expect(sortConfig.supported).toBe(true);
            expect(sortConfig.disabled).toBe(true);
            expect(sortConfig.availableSorts).toEqual([]);
        });

        it("should offer a viewBy sort (no area sort) when there is no stackBy", async () => {
            const sortConfig = await createComponent().getSortConfig(
                referencePoint({ measures: [masterMeasureItems[0]], view: [attributeItems[0]] }),
            );

            expect(sortConfig.disabled).toBe(false);
            expect(sortConfig.availableSorts).toHaveLength(1);
            expect(sortConfig.availableSorts[0].itemId.localIdentifier).toBe(
                attributeItems[0].localIdentifier,
            );
            expect(sortConfig.availableSorts[0].attributeSort!.areaSortEnabled).toBe(false);
            expect(sortConfig.availableSorts[0].metricSorts).toHaveLength(1);
        });

        it("should offer a measure sort per metric bucket item when there is no stackBy", async () => {
            const sortConfig = await createComponent().getSortConfig(
                referencePoint({
                    measures: [masterMeasureItems[0]],
                    secondaryMeasures: [masterMeasureItems[1]],
                    view: [attributeItems[0]],
                }),
            );

            expect(
                sortConfig.availableSorts[0].metricSorts?.map(
                    (metricSort) =>
                        metricSort.locators.find(isMeasureLocator)?.measureLocatorItem.measureIdentifier,
                ),
            ).toEqual([masterMeasureItems[0].localIdentifier, masterMeasureItems[1].localIdentifier]);
        });

        it("should offer the viewBy and area sorts but no measure sort when stacked with one metric", async () => {
            const sortConfig = await createComponent().getSortConfig(singleMetricStacked);

            expect(sortConfig.disabled).toBe(false);
            expect(sortConfig.availableSorts[0].attributeSort).toEqual({
                normalSortEnabled: true,
                areaSortEnabled: true,
            });
            expect(sortConfig.availableSorts[0].metricSorts).toBeUndefined();
        });

        it("should offer only the viewBy sort when stacked with both metrics", async () => {
            const sortConfig = await createComponent().getSortConfig(bothMetricsStacked);

            expect(sortConfig.disabled).toBe(false);
            expect(sortConfig.availableSorts[0].attributeSort).toEqual({
                normalSortEnabled: true,
                areaSortEnabled: false,
            });
            expect(sortConfig.availableSorts[0].metricSorts).toBeUndefined();
        });

        it("should turn a saved measure sort into the area sort when stacked with one metric", async () => {
            const sortConfig = await createComponent().getSortConfig({
                ...singleMetricStacked,
                properties: { sortItems: [newMeasureSort(masterMeasureItems[0].localIdentifier, "desc")] },
            });

            expect(sortConfig.appliedSort).toEqual([
                newAttributeAreaSort(attributeItems[0].localIdentifier, "desc"),
            ]);
        });

        it("should turn a saved measure sort into the default sort when stacked with both metrics", async () => {
            const sortConfig = await createComponent().getSortConfig({
                ...bothMetricsStacked,
                properties: { sortItems: [newMeasureSort(masterMeasureItems[1].localIdentifier, "desc")] },
            });

            expect(sortConfig.appliedSort).toEqual([
                newAttributeSort(attributeItems[0].localIdentifier, "asc"),
            ]);
        });
    });

    describe("getExecution", () => {
        const insightSortItems: ISortItem[] = [newAttributeSort("a1", "asc"), newMeasureSort("m1", "desc")];
        const withSorts = (insight: IInsightDefinition, sorts: ISortItem[]): IInsightDefinition => ({
            insight: { ...insight.insight, sorts },
        });

        it("should strip measure sorts from the stacked execution", () => {
            const execution = createComponent().getExecution(
                { messages },
                withSorts(insightWithSingleMeasureAndViewByAndStack, insightSortItems),
                executionFactory,
            );

            expect(execution.definition.sortBy).toEqual([newAttributeSort("a1", "asc")]);
        });

        it("should not hand the stripped measure sort to the chart to apply on the client", () => {
            createComponent().update(
                { messages },
                withSorts(insightWithSingleMeasureAndViewByAndStack, insightSortItems),
                {},
                executionFactory,
            );

            const renderEl = getLastRenderEl<ICoreChartProps>(mockRenderFun, mockElement);
            expect(renderEl!.props.config).toBeDefined();
            expect(renderEl!.props.config!.sortBy).toBeUndefined();
        });

        it("should keep measure sorts in the execution without a stackBy attribute", () => {
            const execution = createComponent().getExecution(
                { messages },
                withSorts(insightWithSingleMeasureAndViewBy, insightSortItems),
                executionFactory,
            );

            expect(execution.definition.sortBy).toEqual(insightSortItems);
        });
    });

    describe("renderVisualization and renderConfigurationPanel", () => {
        it("should mount on the element defined by the callback", () => {
            createComponent().update({ messages }, insightWithSingleMeasure, {}, executionFactory);

            // 1st call renders the chart, 2nd renders the config panel
            expect(mockRenderFun).toHaveBeenCalledTimes(2);
            expect(getLastRenderEl(mockRenderFun, mockElement)).toBeDefined();
            expect(getLastRenderEl(mockRenderFun, mockConfigElement)).toBeDefined();
        });
    });
});
