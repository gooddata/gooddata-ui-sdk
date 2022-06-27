// (C) 2019-2022 GoodData Corporation
import {
    createPivotTableConfig,
    getColumnAttributes,
    getRowAttributes,
    PluggablePivotTable,
} from "../PluggablePivotTable";
import * as testMocks from "../../../../tests/mocks/testMocks";
import * as referencePointMocks from "../../../../tests/mocks/referencePointMocks";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IFilters,
    IGdcConfig,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
} from "../../../../interfaces/Visualization";
import { DefaultLocale, IDrillableItem, ILocale, VisualizationEnvironment } from "@gooddata/sdk-ui";
import { ColumnWidthItem, CorePivotTable, ICorePivotTableProps } from "@gooddata/sdk-ui-pivot";
import { IInsight, ISortItem, ISettings } from "@gooddata/sdk-model";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";
import noop from "lodash/noop";
import cloneDeep from "lodash/cloneDeep";
import {
    invalidAttributeColumnWidthItem,
    invalidMeasureColumnWidthItem,
    invalidMeasureColumnWidthItemInvalidAttribute,
    invalidMeasureColumnWidthItemLocatorsTooShort,
    invalidMeasureColumnWidthItemTooManyLocators,
    transformedWeakMeasureColumnWidth,
    validAttributeColumnWidthItem,
    validMeasureColumnWidthItem,
} from "./widthItemsMock";
import { getMockReferencePoint } from "./mockReferencePoint";
import {
    invalidAttributeSort,
    invalidMeasureSortInvalidAttribute,
    invalidMeasureSortInvalidMeasure,
    invalidMeasureSortLocatorsTooShort,
    invalidMeasureSortTooManyLocators,
    validAttributeSort,
    validMeasureSort,
} from "./sortMocks";
import { getInsightWithDrillDownApplied } from "./getInsightWithDrillDownAppliedMock";
import { createDrillEvent, getLastRenderEl } from "../../tests/testHelpers";

describe("PluggablePivotTable", () => {
    const mockElement = document.createElement("div");
    const mockConfigElement = document.createElement("div");
    const mockRenderFun = jest.fn();
    const backend = dummyBackend();
    const executionFactory = backend.workspace("PROJECTID").execution();

    const defaultProps = {
        projectId: "PROJECTID",
        backend,
        visualizationProperties: {},
        element: () => mockElement,
        configPanelElement: () => mockConfigElement,
        renderFun: mockRenderFun,
        callbacks: {
            afterRender: noop,
            pushData: noop,
            onError: noop,
            onLoadingChanged: noop,
        },
    };

    function createComponent(props: IVisConstruct = defaultProps) {
        return new PluggablePivotTable(props);
    }

    afterEach(() => {
        mockRenderFun.mockReset();
    });

    it("should create visualization", () => {
        const visualization = createComponent();
        expect(visualization).toBeTruthy();
    });

    describe("Drill Down", () => {
        it("should delete intersection filter attributes and sanitize properties", () => {
            const pivotTable = createComponent();
            const result: IInsight = pivotTable.getInsightWithDrillDownApplied(
                getInsightWithDrillDownApplied.sourceInsight,
                {
                    drillDefinition: getInsightWithDrillDownApplied.drillConfig,
                    event: createDrillEvent("column", getInsightWithDrillDownApplied.intersection),
                },
                true,
            );

            expect(result).toEqual(getInsightWithDrillDownApplied.expectedInsight);
        });

        it("should update totals according to the deleted intersection attribute filters", () => {
            const pivotTable = createComponent();
            const result: IInsight = pivotTable.getInsightWithDrillDownApplied(
                getInsightWithDrillDownApplied.sourceInsightWithTotals,
                {
                    drillDefinition: getInsightWithDrillDownApplied.drillConfig,
                    event: createDrillEvent("column", getInsightWithDrillDownApplied.intersection),
                },
                true,
            );

            expect(result).toEqual(getInsightWithDrillDownApplied.expectedInsightWithTotals);
        });
    });

    describe("update", () => {
        function getDefaultOptions(): IVisProps {
            const locale: ILocale = DefaultLocale;
            const drillableItems: IDrillableItem[] = [];
            return {
                locale,
                custom: {
                    drillableItems,
                },
                dimensions: {
                    width: 123,
                    height: 234,
                },
            };
        }

        const emptyPropertiesMeta = {};

        it("should not render table when dataSource is missing", () => {
            const pivotTable = createComponent();

            const options = getDefaultOptions();
            pivotTable.update({ ...options }, testMocks.emptyInsight, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl(mockRenderFun, mockElement);
            expect(renderEl).toBeUndefined();
        });

        it("should have onColumnResized callback when FF enableTableColumnsManualResizing is set to true", () => {
            const pivotTable = createComponent({
                ...defaultProps,
                featureFlags: { enableTableColumnsManualResizing: true },
            });

            const options = getDefaultOptions();
            pivotTable.update(options, testMocks.dummyInsight, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl<ICorePivotTableProps>(mockRenderFun, mockElement);
            expect(renderEl).toBeDefined();
            expect(renderEl.type).toBe(CorePivotTable);

            expect(renderEl.props.onColumnResized).toBeInstanceOf(Function);
        });

        it("should not have onColumnResized callback when FF enableTableColumnsManualResizing is set to false", () => {
            const pivotTable = createComponent({
                ...defaultProps,
                featureFlags: { enableTableColumnsManualResizing: false },
            });

            const options = getDefaultOptions();
            pivotTable.update(options, testMocks.dummyInsight, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl<ICorePivotTableProps>(mockRenderFun, mockElement);
            expect(renderEl).toBeDefined();
            expect(renderEl.type).toBe(CorePivotTable);

            expect(renderEl.props.onColumnResized).toBeUndefined();
        });

        it("should render PivotTable passing down all the necessary properties", () => {
            const pivotTable = createComponent();

            const options = getDefaultOptions();
            pivotTable.update(options, testMocks.dummyInsight, emptyPropertiesMeta, executionFactory);

            const renderEl = getLastRenderEl<ICorePivotTableProps>(mockRenderFun, mockElement);
            expect(renderEl).toBeDefined();
            expect(renderEl.type).toBe(CorePivotTable);

            // TODO should verify props ideally
        });
    });

    describe("getExtendedReferencePoint", () => {
        describe("given simpleStackedReferencePoint", () => {
            const pivotTable = createComponent();
            const sourceReferencePoint = referencePointMocks.simpleStackedReferencePoint;
            const mockPivotTableReferencePoint = getMockReferencePoint(
                sourceReferencePoint.buckets[0].items,
                sourceReferencePoint.buckets[1].items,
                sourceReferencePoint.buckets[2].items,
                [],
                [],
                true,
            );

            const extendedReferencePointPromise: Promise<IExtendedReferencePoint> =
                pivotTable.getExtendedReferencePoint(sourceReferencePoint);

            it("should return a new reference point with adapted buckets", () => {
                const expectedBuckets: IBucketOfFun[] = mockPivotTableReferencePoint.buckets;
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
            });

            it("should return a new reference point with identical filters", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    const expectedFilters: IFilters = sourceReferencePoint.filters;
                    expect(extendedReferencePoint.filters).toEqual(expectedFilters);
                });
            });

            it("should return a new reference point with pivotTable UI config", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.uiConfig).toMatchSnapshot();
                });
            });

            it("should return a new reference point with filtered sortItems (in this case identical)", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    const expectedSortItems: ISortItem[] = sourceReferencePoint.properties.sortItems;
                    expect(extendedReferencePoint.properties.sortItems).toEqual(expectedSortItems);
                });
            });

            it("should return a new reference point with columnWidths", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    const expectedColumnWidths: ColumnWidthItem[] =
                        sourceReferencePoint.properties.controls.columnWidths;
                    expect(extendedReferencePoint.properties.controls.columnWidths).toEqual(
                        expectedColumnWidths,
                    );
                });
            });

            it("should not generate empty columnWidths in a new reference point", () => {
                const emptyControlsReferencePoint: IReferencePoint = {
                    ...sourceReferencePoint,
                    properties: {
                        sortItems: sourceReferencePoint.properties.sortItems,
                    },
                };
                const promise: Promise<IExtendedReferencePoint> =
                    pivotTable.getExtendedReferencePoint(emptyControlsReferencePoint);
                return promise.then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.properties.controls).toBeUndefined();
                });
            });
        });

        describe("given multipleMetricsAndCategoriesReferencePoint", () => {
            const pivotTable = createComponent();
            const sourceReferencePoint = referencePointMocks.multipleMetricsAndCategoriesReferencePoint;
            const mockPivotTableReferencePoint = getMockReferencePoint(
                sourceReferencePoint.buckets[0].items,
                sourceReferencePoint.buckets[1].items,
                sourceReferencePoint.buckets[2].items,
            );

            const extendedReferencePointPromise: Promise<IExtendedReferencePoint> =
                pivotTable.getExtendedReferencePoint(sourceReferencePoint);

            it("should return a new reference point with adapted buckets", () => {
                const expectedBuckets: IBucketOfFun[] = mockPivotTableReferencePoint.buckets;
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
            });

            it("should return a new reference point with identical filters", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    const expectedFilters: IFilters = sourceReferencePoint.filters;
                    expect(extendedReferencePoint.filters).toEqual(expectedFilters);
                });
            });

            it("should return a new reference point with pivotTable UI config", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.uiConfig).toMatchSnapshot();
                });
            });

            it("should return a new reference point with filtered sortItems (in this case identical)", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    const expectedSortItems: ISortItem[] = sourceReferencePoint.properties.sortItems;
                    expect(extendedReferencePoint.properties.sortItems).toEqual(expectedSortItems);
                });
            });
        });

        it("should return a new reference point with invalid sortItems removed", () => {
            const pivotTable = createComponent();
            const sourceReferencePoint = referencePointMocks.simpleStackedReferencePoint;
            const mockPivotTableReferencePoint = getMockReferencePoint(
                sourceReferencePoint.buckets[0].items,
                sourceReferencePoint.buckets[1].items,
                sourceReferencePoint.buckets[2].items,
                [],
                [
                    invalidAttributeSort,
                    invalidMeasureSortInvalidMeasure,
                    invalidMeasureSortInvalidAttribute,
                    invalidMeasureSortLocatorsTooShort,
                    invalidMeasureSortTooManyLocators,
                    validAttributeSort,
                    validMeasureSort,
                ],
            );
            const expectedSortItems: ISortItem[] = [validAttributeSort, validMeasureSort];

            const extendedReferencePointPromise: Promise<IExtendedReferencePoint> =
                pivotTable.getExtendedReferencePoint(mockPivotTableReferencePoint);
            return extendedReferencePointPromise.then((extendedReferencePoint) => {
                expect(extendedReferencePoint.properties.sortItems).toEqual(expectedSortItems);
            });
        });

        it("should return a new reference point with invalid columnWidths removed", () => {
            const pivotTable = createComponent();
            const sourceReferencePoint = referencePointMocks.simpleStackedReferencePoint;
            const mockPivotTableReferencePoint: IExtendedReferencePoint = getMockReferencePoint(
                sourceReferencePoint.buckets[0].items,
                sourceReferencePoint.buckets[1].items,
                sourceReferencePoint.buckets[2].items,
                [],
                [],
                true,
                [
                    invalidAttributeColumnWidthItem,
                    invalidMeasureColumnWidthItem,
                    invalidMeasureColumnWidthItemInvalidAttribute,
                    invalidMeasureColumnWidthItemLocatorsTooShort,
                    invalidMeasureColumnWidthItemTooManyLocators,
                    validAttributeColumnWidthItem,
                    validMeasureColumnWidthItem,
                ],
            );
            const expectedColumnWidthItems: ColumnWidthItem[] = [
                transformedWeakMeasureColumnWidth,
                validAttributeColumnWidthItem,
                validMeasureColumnWidthItem,
            ];

            const extendedReferencePointPromise: Promise<IExtendedReferencePoint> =
                pivotTable.getExtendedReferencePoint(mockPivotTableReferencePoint);
            return extendedReferencePointPromise.then((extendedReferencePoint) => {
                expect(extendedReferencePoint.properties.controls.columnWidths).toEqual(
                    expectedColumnWidthItems,
                );
            });
        });

        describe("given a reference point with duplicate attributes", () => {
            const pivotTable = createComponent();
            const sourceReferencePoint = referencePointMocks.sameCategoryAndStackReferencePoint;
            const mockReferencePoint = getMockReferencePoint(
                sourceReferencePoint.buckets[0].items,
                sourceReferencePoint.buckets[1].items,
                [],
                [],
                [],
                true,
            );

            const extendedReferencePointPromise = pivotTable.getExtendedReferencePoint(sourceReferencePoint);

            it("should return a new reference point without duplicates in buckets", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    const expectedBuckets: IBucketOfFun[] = mockReferencePoint.buckets;
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
            });
        });

        describe("given an empty reference point", () => {
            const pivotTable = createComponent();
            const mockReferencePoint = getMockReferencePoint();

            const extendedReferencePointPromise = pivotTable.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            it("should return a new reference point with empty buckets", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    const expectedBuckets: IBucketOfFun[] = mockReferencePoint.buckets;
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
            });

            it("should return a new reference point with empty filters", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    const expectedFilters: IFilters = { localIdentifier: "filters", items: [] };
                    expect(extendedReferencePoint.filters).toEqual(expectedFilters);
                });
            });

            it("should return a new reference point with pivotTable UI config", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.uiConfig).toMatchSnapshot();
                });
            });

            it("should return a new reference point without sortItems (default)", () => {
                return extendedReferencePointPromise.then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.properties.sortItems).toBeUndefined();
                });
            });
        });

        it("should return a new reference point with totals", () => {
            const pivotTable = createComponent();
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: cloneDeep(referencePointMocks.tableTotalsReferencePoint.buckets[0].items),
                },
                {
                    localIdentifier: "attribute",
                    items: cloneDeep(referencePointMocks.tableTotalsReferencePoint.buckets[1].items),
                    totals: [
                        {
                            measureIdentifier: "m1",
                            attributeIdentifier: "a2",
                            type: "sum",
                            alias: "Sum",
                        },
                        {
                            measureIdentifier: "m2",
                            attributeIdentifier: "a1",
                            type: "nat",
                        },
                    ],
                },
                {
                    localIdentifier: "columns",
                    items: [],
                },
            ];

            return pivotTable
                .getExtendedReferencePoint(
                    referencePointMocks.tableGrandAndSubtotalsReferencePoint,
                    referencePointMocks.tableTotalsReferencePoint,
                )
                .then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
        });

        describe("native totals", () => {
            it("should remove native total if measure value filter is present", () => {
                const pivotTable = createComponent();

                const expectedTotals = [
                    {
                        measureIdentifier: "m1",
                        attributeIdentifier: "a1",
                        type: "sum",
                        alias: "Sum",
                    },
                ];

                return pivotTable
                    .getExtendedReferencePoint(
                        referencePointMocks.measureValueFilterAndInvalidNatTotal,
                        referencePointMocks.tableWithNativeTotal,
                    )
                    .then((extendedReferencePoint) => {
                        expect(extendedReferencePoint.buckets[1].totals).toEqual(expectedTotals);
                    });
            });

            it("should remove native total if ranking filter is present", () => {
                const pivotTable = createComponent();

                const expectedTotals = [
                    {
                        measureIdentifier: "m1",
                        attributeIdentifier: "a1",
                        type: "sum",
                        alias: "Sum",
                    },
                ];

                return pivotTable
                    .getExtendedReferencePoint(
                        referencePointMocks.rankingFilterAndInvalidNatTotal,
                        referencePointMocks.tableWithNativeTotal,
                    )
                    .then((extendedReferencePoint) => {
                        expect(extendedReferencePoint.buckets[1].totals).toEqual(expectedTotals);
                    });
            });
        });

        it("should return a new reference point without updating grand totals and subtotals", () => {
            const expectedBuckets: IBucketOfFun[] = [
                {
                    localIdentifier: "measures",
                    items: cloneDeep(
                        referencePointMocks.tableGrandAndSubtotalsReferencePoint.buckets[0].items,
                    ),
                },
                {
                    localIdentifier: "attribute",
                    items: cloneDeep(
                        referencePointMocks.tableGrandAndSubtotalsReferencePoint.buckets[1].items,
                    ),
                    totals: [
                        {
                            measureIdentifier: "m1",
                            attributeIdentifier: "a2",
                            type: "sum",
                            alias: "Sum",
                        },
                        {
                            measureIdentifier: "m2",
                            attributeIdentifier: "a1",
                            type: "nat",
                        },
                    ],
                },
                {
                    localIdentifier: "columns",
                    items: [],
                },
            ];

            return createComponent()
                .getExtendedReferencePoint(referencePointMocks.tableGrandAndSubtotalsReferencePoint)
                .then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
        });

        it("should return a new reference point with ui config supporting mulple date dimensions when turned on", () => {
            const pivotTable = createComponent({
                ...defaultProps,
                featureFlags: {
                    enableMultipleDates: true,
                },
            });
            const sourceReferencePoint = referencePointMocks.simpleStackedReferencePoint;

            return pivotTable
                .getExtendedReferencePoint(sourceReferencePoint)
                .then((extendedReferencePoint) => {
                    expect(extendedReferencePoint.uiConfig).toMatchSnapshot();
                });
        });
    });
});

const measureReferenceBucketItem: IBucketItem = {
    type: "metric",
    localIdentifier: "measure",
    attribute: "aa5JBkFDa7sJ",
    granularity: null,
    filters: [],
};

const dateReferenceBucketItem: IBucketItem = {
    granularity: "GDC.time.year",
    localIdentifier: "date",
    type: "date",
    filters: [],
    attribute: "attr.datedataset",
};

const attributeReferenceBucketItem: IBucketItem = {
    aggregation: null,
    showInPercent: null,
    granularity: "attr.restaurantlocation.locationname",
    localIdentifier: "attribute",
    type: "attribute",
    filters: [],
    attribute: "attr.restaurantlocation.locationname",
};

// Creates a theoretical bucket with one of each bucketItemTypes
const createMockBucket = (type: string): IBucketOfFun => {
    return {
        localIdentifier: type,
        items: [
            {
                ...measureReferenceBucketItem,
                localIdentifier: `${measureReferenceBucketItem.localIdentifier}_${type}`,
            },
            {
                ...dateReferenceBucketItem,
                localIdentifier: `${dateReferenceBucketItem.localIdentifier}_${type}`,
            },
            {
                ...attributeReferenceBucketItem,
                localIdentifier: `${attributeReferenceBucketItem.localIdentifier}_${type}`,
            },
        ],
    };
};

const knownBucketNames = [
    "measures",
    "secondary_measures",
    "tertiary_measures",
    "attribute",
    "attributes",
    "view",
    "stack",
    "trend",
    "segment",
    "rows",
    "columns",
];

const allBucketTypes: IBucketOfFun[] = knownBucketNames.map((bucketName) => createMockBucket(bucketName));

describe("getColumnAttributes", () => {
    it("should collect common and date attributes from buckets: columns, stack, segment", () => {
        expect(getColumnAttributes(allBucketTypes)).toEqual([
            {
                attribute: "attr.datedataset",
                filters: [],
                granularity: "GDC.time.year",
                localIdentifier: "date_columns",
                type: "date",
            },
            {
                aggregation: null,
                attribute: "attr.restaurantlocation.locationname",
                filters: [],
                granularity: "attr.restaurantlocation.locationname",
                localIdentifier: "attribute_columns",
                showInPercent: null,
                type: "attribute",
            },
            {
                attribute: "attr.datedataset",
                filters: [],
                granularity: "GDC.time.year",
                localIdentifier: "date_stack",
                type: "date",
            },
            {
                aggregation: null,
                attribute: "attr.restaurantlocation.locationname",
                filters: [],
                granularity: "attr.restaurantlocation.locationname",
                localIdentifier: "attribute_stack",
                showInPercent: null,
                type: "attribute",
            },
            {
                attribute: "attr.datedataset",
                filters: [],
                granularity: "GDC.time.year",
                localIdentifier: "date_segment",
                type: "date",
            },
            {
                aggregation: null,
                attribute: "attr.restaurantlocation.locationname",
                filters: [],
                granularity: "attr.restaurantlocation.locationname",
                localIdentifier: "attribute_segment",
                showInPercent: null,
                type: "attribute",
            },
        ]);
    });
});

describe("getRowAttributes", () => {
    it("should collect common and date attributes from buckets: attribute, attributes, view, trend", () => {
        expect(getRowAttributes(allBucketTypes)).toEqual([
            {
                attribute: "attr.datedataset",
                filters: [],
                granularity: "GDC.time.year",
                localIdentifier: "date_attribute",
                type: "date",
            },
            {
                aggregation: null,
                attribute: "attr.restaurantlocation.locationname",
                filters: [],
                granularity: "attr.restaurantlocation.locationname",
                localIdentifier: "attribute_attribute",
                showInPercent: null,
                type: "attribute",
            },
            {
                attribute: "attr.datedataset",
                filters: [],
                granularity: "GDC.time.year",
                localIdentifier: "date_attributes",
                type: "date",
            },
            {
                aggregation: null,
                attribute: "attr.restaurantlocation.locationname",
                filters: [],
                granularity: "attr.restaurantlocation.locationname",
                localIdentifier: "attribute_attributes",
                showInPercent: null,
                type: "attribute",
            },
            {
                attribute: "attr.datedataset",
                filters: [],
                granularity: "GDC.time.year",
                localIdentifier: "date_view",
                type: "date",
            },
            {
                aggregation: null,
                attribute: "attr.restaurantlocation.locationname",
                filters: [],
                granularity: "attr.restaurantlocation.locationname",
                localIdentifier: "attribute_view",
                showInPercent: null,
                type: "attribute",
            },
            {
                attribute: "attr.datedataset",
                filters: [],
                granularity: "GDC.time.year",
                localIdentifier: "date_trend",
                type: "date",
            },
            {
                aggregation: null,
                attribute: "attr.restaurantlocation.locationname",
                filters: [],
                granularity: "attr.restaurantlocation.locationname",
                localIdentifier: "attribute_trend",
                showInPercent: null,
                type: "attribute",
            },
        ]);
    });
});

describe("createPivotTableConfig", () => {
    const columnWidths = [
        {
            attributeColumnWidthItem: {
                width: { value: 740 },
                attributeIdentifier: "294512a6b2ed4be8bd3948dd14db1950",
            },
        },
    ];

    const Scenarios: Array<
        [string, IGdcConfig, VisualizationEnvironment | undefined, ISettings, ColumnWidthItem[]]
    > = [
        ["config without menus for dashboard env", {}, "dashboards", {}, undefined],
        ["config with menus for non-dashboard env", {}, "none", {}, undefined],
        ["config with menus for undefined env", {}, "none", {}, undefined],
        ["config with separators", { separators: { decimal: ".", thousand: "-" } }, "none", {}, undefined],
        [
            "config with auto-resize if feature flag on",
            {},
            "none",
            { enableTableColumnsAutoResizing: true },
            undefined,
        ],
        [
            "config with growToFit if feature flag on and environment !== dashboards",
            {},
            "none",
            { enableTableColumnsGrowToFit: true },
            undefined,
        ],
        [
            "config with growToFit if feature flag on and environment === dashboards",
            {},
            "dashboards",
            { enableTableColumnsGrowToFit: true },
            undefined,
        ],
        [
            "config with growToFit if feature flag on and environment === analyticalDesigner",
            {},
            "analyticalDesigner",
            { enableTableColumnsGrowToFit: true },
            undefined,
        ],
        [
            "config with manualResizing if feature flag on and configs are not defined",
            {},
            "none",
            { enableTableColumnsManualResizing: true },
            undefined,
        ],
        [
            "config with manualResizing if feature flag on and configs are empty",
            {},
            "none",
            { enableTableColumnsManualResizing: true },
            [],
        ],
        [
            "config with manualResizing if feature flag on and configs are provided",
            {},
            "none",
            { enableTableColumnsManualResizing: true },
            columnWidths,
        ],
        [
            "config with manualResizing if feature flag off and configs are provided",
            {},
            "none",
            { enableTableColumnsManualResizing: false },
            columnWidths,
        ],
    ];

    const AllTotalCapabilities: IBackendCapabilities = {
        canCalculateTotals: true,
        canCalculateGrandTotals: true,
        canCalculateSubTotals: true,
        canCalculateNativeTotals: true,
    };
    it.each(Scenarios)("should create valid %s", (_desc, config, env, settings, columnWidths) => {
        expect(
            createPivotTableConfig(config, env, settings, AllTotalCapabilities, columnWidths),
        ).toMatchSnapshot();
    });
});
