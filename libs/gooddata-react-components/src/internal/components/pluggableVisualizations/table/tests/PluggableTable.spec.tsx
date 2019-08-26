// (C) 2019 GoodData Corporation
import { AFM } from "@gooddata/typings";
import * as React from "react";
import * as ReactDom from "react-dom";
import Measure from "react-measure";
import noop = require("lodash/noop");
import cloneDeep = require("lodash/cloneDeep");

import { PluggableTable, removeSortsWithInvalidLocatorCount } from "../PluggableTable";
import * as testMocks from "../../../../mocks/testMocks";
import * as referencePointMocks from "../../../../mocks/referencePointMocks";
import * as uiConfigMocks from "../../../../mocks/uiConfigMocks";
import { IVisConstruct, IBucket, ILocale, IVisProps, IFilters } from "../../../../interfaces/Visualization";
import SpyInstance = jest.SpyInstance;
import { VisualizationEnvironment } from "../../../../../components/uri/Visualization";
import { IDrillableItem } from "../../../../../interfaces/DrillEvents";
import { Table } from "../../../../../components/core/Table";
import { OverTimeComparisonTypes } from "../../../../../interfaces/OverTimeComparison";
import * as BucketNames from "../../../../../constants/bucketNames";
import { DEFAULT_LOCALE } from "../../../../../constants/localization";

describe("removeSortsWithInvalidLocatorCount", () => {
    const validMeasureSort: AFM.IMeasureSortItem = {
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
            locators: [],
        },
    };

    it("should remove sort locator count different than the specified count", () => {
        const referencePointWithInvalidSorts = {
            ...referencePointMocks.tableTotalsReferencePoint,
            properties: {
                sortItems: [
                    validMeasureSort,
                    invalidMeasureSortTooManyLocators,
                    invalidMeasureSortLocatorsTooShort,
                ],
            },
        };

        removeSortsWithInvalidLocatorCount(referencePointWithInvalidSorts, 1);

        expect(referencePointWithInvalidSorts.properties.sortItems).toEqual([validMeasureSort]);
    });
});
describe("PluggableTable", () => {
    const environment: VisualizationEnvironment = "none";
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
        environment,
    };

    function createComponent(props: Partial<IVisConstruct> = {}) {
        // tslint:disable-next-line:no-inner-html
        document.body.innerHTML = '<div id="tableElement" />';
        return new PluggableTable({
            ...defaultProps,
            ...props,
        });
    }

    it("should create visualization", () => {
        const visualization = createComponent();

        expect(visualization).toBeTruthy();
    });

    describe("init", () => {
        it("should not call pushData with initial properties, because it does not support properties", () => {
            const pushData = jest.fn();

            createComponent({
                ...defaultProps,
                callbacks: {
                    pushData,
                },
            });

            expect(pushData).not.toHaveBeenCalled();
        });
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
                    stickyHeaderOffset: 12,
                    drillableItems,
                    totalsEditAllowed: true,
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
            const table = createComponent();

            const createElementSpy = spyOnFakeElement();
            const renderSpy = spyOnRender();

            const options = getDefaultOptions();
            table.update({ ...options, dataSource: null }, {}, testMocks.emptyMdObject);

            expect(renderSpy).toHaveBeenCalledTimes(0);

            createElementSpy.mockRestore();
            renderSpy.mockRestore();
        });

        it("should render Table and pass down all the necessary properties", () => {
            const table = createComponent();

            const createElementSpy = spyOnFakeElement();
            const renderSpy = spyOnRender();

            const options = getDefaultOptions();
            table.update(options, {}, testMocks.emptyMdObject);

            expect(createElementSpy).toHaveBeenCalledWith(Table, {
                projectId: "PROJECTID",
                afterRender: defaultProps.callbacks.afterRender,
                config: undefined,
                dataSource: testMocks.dummyDataSource,
                drillableItems: options.custom.drillableItems,
                environment: defaultProps.environment,
                locale: options.locale,
                onError: defaultProps.callbacks.onError,
                onExportReady: undefined,
                onLoadingChanged: defaultProps.callbacks.onLoadingChanged,
                pushData: defaultProps.callbacks.pushData,
                stickyHeaderOffset: options.custom.stickyHeaderOffset,
                totals: [],
                totalsEditAllowed: options.custom.totalsEditAllowed,
                resultSpec: options.resultSpec,
                ErrorComponent: null,
                LoadingComponent: null,
            });

            spyOnCleanup(renderSpy, createElementSpy);
        });

        it("should render Table wrapped in React.Measure when height missing", () => {
            const table = createComponent();

            const createElementSpy = spyOnFakeElement();
            const renderSpy = spyOnRender();

            const options = {
                ...getDefaultOptions(),
                dimensions: {
                    width: 100,
                    height: undefined as number,
                },
            };

            table.update(options, {}, testMocks.emptyMdObject);

            const mockCallArguments = createElementSpy.mock.calls[0];
            expect(mockCallArguments[0]).toEqual(Measure);
            expect(mockCallArguments[1]).toEqual({ client: true });

            spyOnCleanup(renderSpy, createElementSpy);
        });

        it("should pass correctly expanded totals in resultSpec through update", () => {
            const table = createComponent();

            const createElementSpy = spyOnFakeElement();
            const renderSpy = spyOnRender();

            const options = getDefaultOptions();
            options.dataSource = testMocks.dataSourceWithTotals;
            table.update(options, {}, testMocks.mdObjectWithTotals);

            const totalsProp = (createElementSpy.mock.calls[0][1] as any).totals;
            expect(totalsProp).toEqual(testMocks.mdObjectWithTotals.buckets[1].totals);

            const resultSpecProp: AFM.IResultSpec = (createElementSpy.mock.calls[0][1] as any).resultSpec;
            const expectedResultSpecTotals: AFM.ITotalItem[] = [
                {
                    measureIdentifier: "m1",
                    type: "sum",
                    attributeIdentifier: "a1",
                },
                {
                    measureIdentifier: "m2",
                    type: "sum",
                    attributeIdentifier: "a1",
                },
                {
                    measureIdentifier: "m1",
                    type: "avg",
                    attributeIdentifier: "a1",
                },
                {
                    measureIdentifier: "m2",
                    type: "avg",
                    attributeIdentifier: "a1",
                },
                {
                    measureIdentifier: "m1",
                    type: "nat",
                    attributeIdentifier: "a1",
                },
                {
                    measureIdentifier: "m2",
                    type: "nat",
                    attributeIdentifier: "a1",
                },
            ];

            expect(resultSpecProp.dimensions[0].totals).toEqual(expectedResultSpecTotals);

            spyOnCleanup(renderSpy, createElementSpy);
        });
    });

    describe("getExtendedReferencePoint", () => {
        it("should return reference point with metrics and categories concat with stacks", async () => {
            const table = createComponent();

            const expectedBuckets: IBucket[] = [
                {
                    localIdentifier: "measures",
                    items: cloneDeep(referencePointMocks.simpleStackedReferencePoint.buckets[0].items),
                },
                {
                    localIdentifier: "attribute",
                    items: cloneDeep(referencePointMocks.simpleStackedReferencePoint.buckets[1].items).concat(
                        cloneDeep(referencePointMocks.simpleStackedReferencePoint.buckets[2].items),
                    ),
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: referencePointMocks.simpleStackedReferencePoint.filters.items,
            };
            const expectedProperties = referencePointMocks.simpleStackedReferencePoint.properties;

            const extendedReferencePoint = await table.getExtendedReferencePoint(
                referencePointMocks.simpleStackedReferencePoint,
            );

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.simpleStackedTableUiConfig,
                properties: expectedProperties,
            });
        });

        it("should return reference point with multiple metrics and categories", async () => {
            const table = createComponent();

            const expectedBuckets: IBucket[] = [
                {
                    localIdentifier: "measures",
                    items: cloneDeep(
                        referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[0].items,
                    ),
                },
                {
                    localIdentifier: "attribute",
                    items: cloneDeep(
                        referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[1].items,
                    ).concat(
                        cloneDeep(
                            referencePointMocks.multipleMetricsAndCategoriesReferencePoint.buckets[2].items,
                        ),
                    ),
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: referencePointMocks.multipleMetricsAndCategoriesReferencePoint.filters.items,
            };
            const expectedProperties =
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint.properties;

            const extendedReferencePoint = await table.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsAndCategoriesReferencePoint,
            );

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.multipleMetricsAndCategoriesTableUiConfig,
                properties: expectedProperties,
            });
        });

        it("should return reference point with metrics", async () => {
            const table = createComponent();

            const expectedBuckets: IBucket[] = [
                {
                    localIdentifier: "measures",
                    items: cloneDeep(
                        referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[0].items,
                    ),
                },
                {
                    localIdentifier: "attribute",
                    items: cloneDeep(
                        referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[1].items,
                    ).concat(
                        cloneDeep(
                            referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[2].items,
                        ),
                    ),
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: referencePointMocks.multipleMetricsNoCategoriesReferencePoint.filters.items,
            };
            const expectedProperties =
                referencePointMocks.multipleMetricsNoCategoriesReferencePoint.properties;

            const extendedReferencePoint = await table.getExtendedReferencePoint(
                referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
            );

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.multipleMetricsAndCategoriesTableUiConfig,
                properties: expectedProperties,
            });
        });

        it("should return reference point without duplicates in attributes", async () => {
            const table = createComponent();

            const expectedBuckets: IBucket[] = [
                {
                    localIdentifier: "measures",
                    items: cloneDeep(referencePointMocks.sameCategoryAndStackReferencePoint.buckets[0].items),
                },
                {
                    localIdentifier: "attribute",
                    items: cloneDeep(referencePointMocks.sameCategoryAndStackReferencePoint.buckets[1].items),
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: referencePointMocks.sameCategoryAndStackReferencePoint.filters.items,
            };
            const expectedProperties = referencePointMocks.sameCategoryAndStackReferencePoint.properties;

            const extendedReferencePoint = await table.getExtendedReferencePoint(
                referencePointMocks.sameCategoryAndStackReferencePoint,
            );

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.sameCategoryAndStackTableUiConfig,
                properties: expectedProperties,
            });
        });

        it("should return reference point with totals", async () => {
            const table = createComponent();

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
                            attributeIdentifier: "a1",
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
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: referencePointMocks.tableTotalsReferencePoint.filters.items,
            };
            const expectedProperties = referencePointMocks.tableTotalsReferencePoint.properties;

            const extendedReferencePoint = await table.getExtendedReferencePoint(
                referencePointMocks.tableTotalsReferencePoint,
            );

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.tableTotalsUiConfig,
                properties: expectedProperties,
            });
        });

        it("should remove invalid sorts from reference point and return default sort item", async () => {
            const table = createComponent();

            const extendedReferencePoint = await table.getExtendedReferencePoint(
                referencePointMocks.TableRefencePointWithInvalidSort,
            );

            expect(extendedReferencePoint.properties).toEqual({
                sortItems: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: "a1",
                            direction: "asc",
                        },
                    },
                ],
            });
        });

        it("should correctly consume empty reference point", async () => {
            const table = createComponent();

            const expectedBuckets: IBucket[] = [
                {
                    localIdentifier: "measures",
                    items: [],
                },
                {
                    localIdentifier: "attribute",
                    items: [],
                },
            ];
            const expectedFilters: IFilters = {
                localIdentifier: "filters",
                items: [],
            };

            const extendedReferencePoint = await table.getExtendedReferencePoint(
                referencePointMocks.emptyReferencePoint,
            );

            expect(extendedReferencePoint).toEqual({
                buckets: expectedBuckets,
                filters: expectedFilters,
                uiConfig: uiConfigMocks.tableTotalsUiConfig,
                properties: {},
            });
        });

        describe("Over Time Comparison", () => {
            it("should place new derived bucket items to right place in referencePoint buckets", async () => {
                const table = createComponent();

                const referencePointWithDerivedItems = await table.addNewDerivedBucketItems(
                    referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
                    [referencePointMocks.derivedMeasureItems[0], referencePointMocks.derivedMeasureItems[1]],
                );

                expect(referencePointWithDerivedItems).toEqual({
                    ...referencePointMocks.multipleMetricsNoCategoriesReferencePoint,
                    ...{
                        buckets: [
                            {
                                localIdentifier: BucketNames.MEASURES,
                                items: [
                                    referencePointMocks.derivedMeasureItems[0],
                                    referencePointMocks.masterMeasureItems[0],
                                    referencePointMocks.derivedMeasureItems[1],
                                    referencePointMocks.masterMeasureItems[1],
                                    referencePointMocks.masterMeasureItems[2],
                                    referencePointMocks.masterMeasureItems[3],
                                ],
                            },
                            referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[1],
                            referencePointMocks.multipleMetricsNoCategoriesReferencePoint.buckets[2],
                        ],
                    },
                });
            });

            it("should return reference point containing uiConfig with PP, SP supported comparison types", async () => {
                const component = createComponent();

                const extendedReferencePoint = await component.getExtendedReferencePoint(
                    referencePointMocks.emptyReferencePoint,
                );

                expect(extendedReferencePoint.uiConfig.supportedOverTimeComparisonTypes).toEqual([
                    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
                    OverTimeComparisonTypes.PREVIOUS_PERIOD,
                ]);
            });
        });
    });
});
