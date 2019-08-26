// (C) 2019 GoodData Corporation
import * as React from "react";
import * as ReactDom from "react-dom";
import { AFM } from "@gooddata/typings";

import {
    PluggablePivotTable,
    getColumnAttributes,
    getRowAttributes,
    adaptReferencePointSortItemsToPivotTable,
    addDefaultSort,
    isSortItemVisible,
} from "../PluggablePivotTable";
import * as testMocks from "../../../../mocks/testMocks";
import * as referencePointMocks from "../../../../mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../mocks/uiConfigMocks";
import {
    IVisConstruct,
    IBucket,
    ILocale,
    IVisProps,
    IFilters,
    IExtendedReferencePoint,
    IBucketItem,
    IFiltersBucketItem,
    IBucketFilter,
    IBucketFilterElement,
} from "../../../../interfaces/Visualization";
import noop = require("lodash/noop");
import cloneDeep = require("lodash/cloneDeep");
import SpyInstance = jest.SpyInstance;
import { IDrillableItem } from "../../../../../interfaces/DrillEvents";
import { PivotTable } from "../../../../../components/core/PivotTable";
import { DEFAULT_LOCALE } from "../../../../../constants/localization";

const getMockReferencePoint = (
    measures: IBucketItem[] = [],
    rows: IBucketItem[] = [],
    columns: IBucketItem[] = [],
    filterItems: IFiltersBucketItem[] = [],
    sortItems: AFM.SortItem[] = [],
    measuresIsShowInPercentEnabled = false,
): IExtendedReferencePoint => ({
    buckets: [
        {
            items: measures,
            localIdentifier: "measures",
        },
        {
            items: rows,
            localIdentifier: "attribute",
        },
        {
            items: columns,
            localIdentifier: "columns",
        },
    ],
    filters: {
        items: filterItems,
        localIdentifier: "filters",
    },
    properties: {
        sortItems,
    },
    uiConfig: {
        buckets: {
            attribute: {
                accepts: ["attribute", "date"],
                allowsReordering: true,
                allowsSwapping: true,
                canAddItems: true,
                enabled: true,
                icon: "",
                isShowInPercentEnabled: false,
                itemsLimit: 20,
                title: "Rows",
            },
            columns: {
                accepts: ["attribute", "date"],
                allowsReordering: true,
                allowsSwapping: true,
                canAddItems: true,
                enabled: true,
                icon: "",
                isShowInPercentEnabled: false,
                itemsLimit: 20,
                title: "Columns",
            },
            filters: {
                accepts: ["attribute", "date"],
                allowsReordering: false,
                enabled: true,
                isShowInPercentEnabled: false,
                itemsLimit: 20,
            },
            measures: {
                accepts: ["metric", "fact", "attribute"],
                allowsDuplicateItems: true,
                allowsReordering: true,
                allowsSwapping: true,
                canAddItems: true,
                enabled: true,
                icon: "",
                isShowInPercentEnabled: measuresIsShowInPercentEnabled,
                isShowInPercentVisible: true,
                itemsLimit: 20,
                title: "Measures",
            },
        },
        exportConfig: {
            supported: true,
        },
        openAsReport: {
            supported: false,
        },
        recommendations: {},
        supportedOverTimeComparisonTypes: ["same_period_previous_year", "previous_period"],
    },
});

// sortItems based on referencePointMocks.simpleStackedReferencePoint
const validMeasureSort: AFM.IMeasureSortItem = {
    measureSortItem: {
        direction: "asc",
        locators: [
            {
                attributeLocatorItem: {
                    attributeIdentifier: "a2",
                    element: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                },
            },
            {
                measureLocatorItem: {
                    measureIdentifier: "m1",
                },
            },
        ],
    },
};

const validAttributeSort: AFM.IAttributeSortItem = {
    attributeSortItem: {
        attributeIdentifier: "a1",
        direction: "desc",
    },
};

const invalidAttributeSort: AFM.IAttributeSortItem = {
    attributeSortItem: {
        attributeIdentifier: "invalid",
        direction: "desc",
    },
};

const invalidMeasureSortInvalidMeasure: AFM.IMeasureSortItem = {
    measureSortItem: {
        direction: "asc",
        locators: [
            {
                attributeLocatorItem: {
                    attributeIdentifier: "a2",
                    element: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                },
            },
            {
                measureLocatorItem: {
                    measureIdentifier: "invalid", // this measure is not in buckets
                },
            },
        ],
    },
};

const invalidMeasureSortInvalidAttribute: AFM.IMeasureSortItem = {
    measureSortItem: {
        direction: "asc",
        locators: [
            {
                attributeLocatorItem: {
                    attributeIdentifier: "a1", // this identifier doesn't exist on second dimension
                    element: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                },
            },
            {
                measureLocatorItem: {
                    measureIdentifier: "m1",
                },
            },
        ],
    },
};

const invalidMeasureSortTooManyLocators: AFM.IMeasureSortItem = {
    measureSortItem: {
        direction: "asc",
        locators: [
            {
                attributeLocatorItem: {
                    attributeIdentifier: "a2",
                    element: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                },
            },
            {
                attributeLocatorItem: {
                    attributeIdentifier: "a2",
                    element: "/gdc/md/PROJECTID/obj/2210/elements?id=1234",
                },
            },
            {
                measureLocatorItem: {
                    measureIdentifier: "m1",
                },
            },
        ],
    },
};

const invalidMeasureSortLocatorsTooShort: AFM.IMeasureSortItem = {
    measureSortItem: {
        direction: "asc",
        locators: [
            {
                measureLocatorItem: {
                    measureIdentifier: "m1",
                },
            },
        ],
    },
};

describe("PluggablePivotTable", () => {
    const defaultProps = {
        projectId: "PROJECTID",
        element: "#tableElement",
        configPanelElement: null as string,
        callbacks: {
            afterRender: noop,
            pushData: noop,
            onError: noop,
            onLoadingChanged: noop,
        },
    };

    function createComponent(props: IVisConstruct = defaultProps) {
        // tslint:disable-next-line:no-inner-html
        document.body.innerHTML = '<div id="tableElement" />';
        return new PluggablePivotTable(props);
    }

    it("should create visualization", () => {
        const visualization = createComponent();
        expect(visualization).toBeTruthy();
    });

    describe("update", () => {
        function getDefaultOptions(): IVisProps {
            const locale: ILocale = DEFAULT_LOCALE;
            const drillableItems: IDrillableItem[] = [];
            return {
                dataSource: testMocks.dummyDataSource,
                resultSpec: testMocks.dummyTableResultSpec,
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

        function spyOnFakeElement() {
            const fakeElement: any = {};
            const createElementSpy = jest.spyOn(React, "createElement");
            createElementSpy.mockReturnValue(fakeElement);
            return createElementSpy;
        }

        function spyOnRender() {
            const renderSpy = jest.spyOn(ReactDom, "render");
            renderSpy.mockImplementation(noop);
            return renderSpy;
        }

        function spyOnCleanup(renderSpy: SpyInstance<any>, createElementSpy: SpyInstance<any>) {
            const targetNode = document.querySelector(defaultProps.element);
            expect(renderSpy).toHaveBeenCalledWith({}, targetNode);

            createElementSpy.mockRestore();
            renderSpy.mockRestore();
        }

        it("should not render table when dataSource is missing", () => {
            const pivotTable = createComponent();

            const createElementSpy = spyOnFakeElement();
            const renderSpy = spyOnRender();

            const options = getDefaultOptions();
            pivotTable.update({ ...options, dataSource: null }, {}, testMocks.emptyMdObject);

            expect(renderSpy).toHaveBeenCalledTimes(0);

            createElementSpy.mockRestore();
            renderSpy.mockRestore();
        });

        it("should render PivotTable passing down all the necessary properties", () => {
            const pivotTable = createComponent();

            const createElementSpy = spyOnFakeElement();
            const renderSpy = spyOnRender();

            const options = getDefaultOptions();
            pivotTable.update(options, {}, testMocks.emptyMdObject);

            expect(createElementSpy).toHaveBeenCalledTimes(1);
            expect(createElementSpy.mock.calls[0][0]).toBe(PivotTable);

            const defaultConfig = {
                menu: {
                    aggregations: true,
                    aggregationsSubMenu: true,
                },
            };
            const props: any = createElementSpy.mock.calls[0][1];
            expect(props.afterRender).toEqual(defaultProps.callbacks.afterRender);
            expect(props.dataSource).toEqual(testMocks.dummyDataSource);
            expect(props.drillableItems).toEqual(options.custom.drillableItems);
            expect(props.height).toEqual(options.dimensions.height);
            expect(props.locale).toEqual(options.locale);
            expect(props.config).toEqual(defaultConfig);
            expect(props.intl).toBeTruthy();
            expect(props.onError).toEqual(defaultProps.callbacks.onError);
            expect(props.onLoadingChanged).toEqual(defaultProps.callbacks.onLoadingChanged);
            expect(props.pushData).toEqual(defaultProps.callbacks.pushData);
            expect(props.totals).toEqual([]);
            expect(props.totalsEditAllowed).toEqual(options.custom.totalsEditAllowed);
            expect(props.resultSpec).toEqual(options.resultSpec);
            expect(props.ErrorComponent).toEqual(null);
            expect(props.LoadingComponent).toEqual(null);

            spyOnCleanup(renderSpy, createElementSpy);
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

            const extendedReferencePointPromise: Promise<
                IExtendedReferencePoint
            > = pivotTable.getExtendedReferencePoint(sourceReferencePoint);

            it("should return a new reference point with adapted buckets", () => {
                const expectedBuckets: IBucket[] = mockPivotTableReferencePoint.buckets;
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
            });

            it("should return a new reference point with identical filters", () => {
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    const expectedFilters: IFilters = sourceReferencePoint.filters;
                    expect(extendedReferencePoint.filters).toEqual(expectedFilters);
                });
            });

            it("should return a new reference point with pivotTable UI config", () => {
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    expect(extendedReferencePoint.uiConfig).toEqual(mockPivotTableReferencePoint.uiConfig);
                });
            });

            it("should return a new reference point with filtered sortItems (in this case identical)", () => {
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    const expectedSortItems: AFM.SortItem[] = sourceReferencePoint.properties.sortItems;
                    expect(extendedReferencePoint.properties.sortItems).toEqual(expectedSortItems);
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

            const extendedReferencePointPromise: Promise<
                IExtendedReferencePoint
            > = pivotTable.getExtendedReferencePoint(sourceReferencePoint);

            it("should return a new reference point with adapted buckets", () => {
                const expectedBuckets: IBucket[] = mockPivotTableReferencePoint.buckets;
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
            });

            it("should return a new reference point with identical filters", () => {
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    const expectedFilters: IFilters = sourceReferencePoint.filters;
                    expect(extendedReferencePoint.filters).toEqual(expectedFilters);
                });
            });

            it("should return a new reference point with pivotTable UI config", () => {
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    expect(extendedReferencePoint.uiConfig).toEqual(uiConfigMocks.defaultPivotTableUiConfig);
                });
            });

            it("should return a new reference point with filtered sortItems (in this case identical)", () => {
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    const expectedSortItems: AFM.SortItem[] = sourceReferencePoint.properties.sortItems;
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
            const expectedSortItems: AFM.SortItem[] = [validAttributeSort, validMeasureSort];

            const extendedReferencePointPromise: Promise<
                IExtendedReferencePoint
            > = pivotTable.getExtendedReferencePoint(mockPivotTableReferencePoint);
            return extendedReferencePointPromise.then(extendedReferencePoint => {
                expect(extendedReferencePoint.properties.sortItems).toEqual(expectedSortItems);
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
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    const expectedBuckets: IBucket[] = mockReferencePoint.buckets;
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
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    const expectedBuckets: IBucket[] = mockReferencePoint.buckets;
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
            });

            it("should return a new reference point with empty filters", () => {
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    const expectedFilters: IFilters = { localIdentifier: "filters", items: [] };
                    expect(extendedReferencePoint.filters).toEqual(expectedFilters);
                });
            });

            it("should return a new reference point with pivotTable UI config", () => {
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    expect(extendedReferencePoint.uiConfig).toEqual(mockReferencePoint.uiConfig);
                });
            });

            it("should return a new reference point without sortItems (default)", () => {
                return extendedReferencePointPromise.then(extendedReferencePoint => {
                    expect(extendedReferencePoint.properties.sortItems).toBeUndefined();
                });
            });
        });

        it("should return a new reference point with totals", () => {
            const pivotTable = createComponent();
            const expectedBuckets: IBucket[] = [
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
                .then(extendedReferencePoint => {
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
                });
        });

        it("should return a new reference point without updating grand totals and subtotals", () => {
            const expectedBuckets: IBucket[] = [
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
                .then(extendedReferencePoint => {
                    expect(extendedReferencePoint.buckets).toEqual(expectedBuckets);
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
const createMockBucket = (type: string): IBucket => {
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

const allBucketTypes: IBucket[] = knownBucketNames.map(bucketName => createMockBucket(bucketName));

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

describe("adaptReferencePointSortItemsToPivotTable", () => {
    const sourceReferencePoint = referencePointMocks.simpleStackedReferencePoint;
    const mockPivotTableReferencePoint: IExtendedReferencePoint = getMockReferencePoint(
        sourceReferencePoint.buckets[0].items,
        sourceReferencePoint.buckets[1].items,
        sourceReferencePoint.buckets[2].items,
        [],
        [],
        true,
    );

    const sourceSortItems: AFM.SortItem[] = [
        invalidAttributeSort,
        invalidMeasureSortInvalidMeasure,
        invalidMeasureSortInvalidAttribute,
        invalidMeasureSortLocatorsTooShort,
        invalidMeasureSortTooManyLocators,
        validAttributeSort,
        validMeasureSort,
    ];

    const measures: IBucketItem[] = mockPivotTableReferencePoint.buckets[0].items;
    const rowAttributes: IBucketItem[] = mockPivotTableReferencePoint.buckets[1].items;
    const columnAttributes: IBucketItem[] = mockPivotTableReferencePoint.buckets[2].items;

    it("should remove invalid sort items", async () => {
        const expectedSortItems: AFM.SortItem[] = [validAttributeSort, validMeasureSort];

        expect(
            adaptReferencePointSortItemsToPivotTable(
                sourceSortItems,
                measures,
                rowAttributes,
                columnAttributes,
            ),
        ).toEqual(expectedSortItems);
    });
});

describe("addDefaultSort", () => {
    const rowFor = (localIdentifier: string, attributeName: string): IBucketItem => ({
        aggregation: null,
        showInPercent: null,
        operator: null,
        operandLocalIdentifiers: null,
        granularity: null,
        masterLocalIdentifier: null,
        localIdentifier,
        showOnSecondaryAxis: null,
        type: "attribute",
        filters: [],
        attribute: attributeName,
    });

    const accountRowId = "d0f1043a2eec42daac004a10c41afdd5";
    const accountRow = rowFor(accountRowId, "attr.account");

    const countryRowId = "6d523113ca754409a8b685736e7fe32b";
    const countryRow = rowFor(countryRowId, "attr.country");

    const productRowId = "38f1d87b8b7c42c1b9a37395a24f7313";
    const productRow = rowFor(productRowId, "attr.product");

    const sortFor = (localId: string, direction: AFM.SortDirection): AFM.SortItem => ({
        attributeSortItem: {
            attributeIdentifier: localId,
            direction,
        },
    });

    const defaultSortFor = (localId: string): AFM.SortItem => sortFor(localId, "asc");

    describe("with no filters specified", () => {
        it("should not add the default sort if no row is specified", () => {
            const expected: AFM.SortItem[] = [];
            const actual = addDefaultSort([], [], [], []);
            expect(actual).toEqual(expected);
        });
        it("should add the default sort for the first row added", () => {
            const expected = [defaultSortFor(accountRowId)];
            const actual = addDefaultSort([], [], [accountRow], []);
            expect(actual).toEqual(expected);
        });
        it("should add the default sort when a row is added to the first place", () => {
            const expected = [defaultSortFor(accountRowId)];
            const actual = addDefaultSort(
                [defaultSortFor(countryRowId)],
                [],
                [accountRow, countryRow],
                [countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change the default sort when a row is added to the second place", () => {
            const expected = [defaultSortFor(countryRowId)];
            const actual = addDefaultSort(
                [defaultSortFor(countryRowId)],
                [],
                [countryRow, accountRow],
                [countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is a desc sort on the first item", () => {
            const expected = [sortFor(countryRowId, "desc")];
            const actual = addDefaultSort(
                [sortFor(countryRowId, "desc")],
                [],
                [countryRow, accountRow],
                [countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is a desc sort on the second item", () => {
            const expected = [sortFor(countryRowId, "desc")];
            const actual = addDefaultSort(
                [sortFor(countryRowId, "desc")],
                [],
                [accountRow, countryRow, productRow],
                [accountRow, countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is an asc sort on the second item", () => {
            const expected = [sortFor(countryRowId, "asc")];
            const actual = addDefaultSort(
                [sortFor(countryRowId, "asc")],
                [],
                [accountRow, countryRow, productRow],
                [accountRow, countryRow],
            );
            expect(actual).toEqual(expected);
        });
        it("should not change sorts when there is a measure sort", () => {
            const measureSort: AFM.IMeasureSortItem = {
                measureSortItem: {
                    direction: "asc",
                    locators: [],
                },
            };
            const expected = [measureSort];
            const actual = addDefaultSort(
                [measureSort],
                [],
                [accountRow, countryRow, productRow],
                [accountRow, countryRow],
            );
            expect(actual).toEqual(expected);
        });
    });

    it("should add default sort if existing measure sort is not visible due to filters (RAIL-1275)", () => {
        const expected = [sortFor(accountRowId, "asc")];
        const uri = "/gdc/md/mockproject/obj/attr.country/elements?id=1";
        const measureSort: AFM.IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: "attr.country",
                            element: uri,
                        },
                    },
                ],
            },
        };
        const filterElement: IBucketFilterElement = {
            title: "Matching",
            uri,
        };
        const actual = addDefaultSort(
            [measureSort],
            [
                {
                    allElements: [filterElement],
                    attribute: "irrelevant",
                    interval: null,
                    isInverted: true,
                    isModified: false,
                    noData: false,
                    overTimeComparisonType: null,
                    selectedElements: [filterElement],
                    totalElementsCount: 1,
                },
            ],
            [accountRow, countryRow, productRow],
            [accountRow, countryRow],
        );
        expect(actual).toEqual(expected);
    });
});

describe("isSortVisible", () => {
    describe("given attribute sort item", () => {
        it("should always return true", () => {
            const actual = isSortItemVisible(
                {
                    attributeSortItem: {
                        attributeIdentifier: "foo",
                        direction: "asc",
                    },
                },
                [],
            );
            const expected = true;
            expect(actual).toEqual(expected);
        });
    });

    describe("given measure sort item", () => {
        const createFilterBucketItem = (
            selectedElements: IBucketFilterElement[],
            isInverted: boolean,
        ): IBucketFilter => ({
            allElements: selectedElements,
            attribute: "irrelevant",
            interval: null,
            isInverted,
            isModified: false,
            noData: false,
            overTimeComparisonType: null,
            selectedElements,
            totalElementsCount: selectedElements.length,
        });

        const matchingUri = "/gdc/md/mockproject/obj/attr.movie_genre/elements?id=1";
        const notMatchingUri = "/gdc/md/mockproject/obj/attr.movie_genre/elements?id=123";
        const sortItem: AFM.IMeasureSortItem = {
            measureSortItem: {
                direction: "asc",
                locators: [
                    {
                        attributeLocatorItem: {
                            attributeIdentifier: "foo",
                            element: matchingUri,
                        },
                    },
                    {
                        measureLocatorItem: {
                            measureIdentifier: "bar",
                        },
                    },
                ],
            },
        };
        const matchingFilterElement: IBucketFilterElement = {
            title: "Matching",
            uri: matchingUri,
        };
        const notMatchingFilterElement: IBucketFilterElement = {
            title: "Not Matching",
            uri: notMatchingUri,
        };

        it("should return true when no filters are specified", () => {
            const actual = isSortItemVisible(sortItem, []);
            const expected = true;
            expect(actual).toEqual(expected);
        });
        it('should return true when empty "notIn" filter is specified', () => {
            const actual = isSortItemVisible(sortItem, [createFilterBucketItem([], true)]);
            const expected = true;
            expect(actual).toEqual(expected);
        });
        it('should return false when "notIn" filter with matching element is specified', () => {
            const actual = isSortItemVisible(sortItem, [
                createFilterBucketItem([matchingFilterElement], true),
            ]);
            const expected = false;
            expect(actual).toEqual(expected);
        });
        it('should return true when "notIn" filter without matching element is specified', () => {
            const actual = isSortItemVisible(sortItem, [
                createFilterBucketItem([notMatchingFilterElement], true),
            ]);
            const expected = true;
            expect(actual).toEqual(expected);
        });

        it('should return false when empty "in" filter is specified', () => {
            const actual = isSortItemVisible(sortItem, [createFilterBucketItem([], false)]);
            const expected = false;
            expect(actual).toEqual(expected);
        });
        it('should return true when "in" filter with matching element is specified', () => {
            const actual = isSortItemVisible(sortItem, [
                createFilterBucketItem([matchingFilterElement], false),
            ]);
            const expected = true;
            expect(actual).toEqual(expected);
        });
        it('should return false when "in" filter without matching element is specified', () => {
            const actual = isSortItemVisible(sortItem, [
                createFilterBucketItem([notMatchingFilterElement], false),
            ]);
            const expected = false;
            expect(actual).toEqual(expected);
        });
    });
});
