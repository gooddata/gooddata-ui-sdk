// (C) 2007-2018 GoodData Corporation
import { VisualizationObject, AFM, VisualizationInput } from "@gooddata/typings";
import MdObjectHelper from "../MdObjectHelper";
import { visualizationObjects, pivotTableMDO } from "../../../__mocks__/fixtures";

describe("MdObjectHelper", () => {
    describe("getTotals", () => {
        it("should return table totals for table chart", () => {
            const totals = MdObjectHelper.getTotals(visualizationObjects[1].visualizationObject);

            expect(totals).toEqual([
                {
                    alias: "average",
                    attributeIdentifier: "a1",
                    measureIdentifier: "m1",
                    type: "avg",
                },
            ]);
        });

        it("should return empty table totals for bar chart", () => {
            const totals = MdObjectHelper.getTotals(visualizationObjects[0].visualizationObject);
            expect(totals).toEqual([]);
        });
    });

    describe("getVisualizationClassUri", () => {
        it("should return uri", () => {
            expect(
                MdObjectHelper.getVisualizationClassUri(visualizationObjects[0].visualizationObject),
            ).toEqual("/gdc/md/myproject/obj/column");
        });
    });

    describe("buildMeasureTitleProps", () => {
        it("should correctly convert every known measure type to title props object", () => {
            const measures: VisualizationObject.IMeasure[] = [
                {
                    measure: {
                        localIdentifier: "m1",
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "/uri1",
                                },
                            },
                        },
                        title: "M1",
                    },
                },
                {
                    measure: {
                        localIdentifier: "m2",
                        definition: {
                            popMeasureDefinition: {
                                popAttribute: {
                                    uri: "/uri2",
                                },
                                measureIdentifier: "m1",
                            },
                        },
                        title: "M2",
                    },
                },
                {
                    measure: {
                        localIdentifier: "m3",
                        definition: {
                            previousPeriodMeasure: {
                                dateDataSets: [
                                    {
                                        dataSet: {
                                            uri: "/uri3",
                                        },
                                        periodsAgo: 1,
                                    },
                                ],
                                measureIdentifier: "m1",
                            },
                        },
                        title: "M3",
                    },
                },
                {
                    measure: {
                        localIdentifier: "m4",
                        definition: {
                            arithmeticMeasure: {
                                measureIdentifiers: ["m1", "m2"],
                                operator: "sum",
                            },
                        },
                        title: "M4",
                    },
                },
                {
                    measure: {
                        localIdentifier: "m5",
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "/uri5",
                                },
                            },
                        },
                        title: "M5",
                        alias: "Renamed M5",
                    },
                },
                {
                    measure: {
                        localIdentifier: "m6",
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "/uri6",
                                },
                            },
                        },
                    },
                },
            ];
            const measureTitleProps = MdObjectHelper.buildMeasureTitleProps(measures);

            expect(measureTitleProps).toEqual([
                {
                    localIdentifier: "m1",
                    title: "M1",
                },
                {
                    localIdentifier: "m2",
                    title: "M2",
                },
                {
                    localIdentifier: "m3",
                    title: "M3",
                },
                {
                    localIdentifier: "m4",
                    title: "M4",
                },
                {
                    localIdentifier: "m5",
                    title: "M5",
                    alias: "Renamed M5",
                },
                {
                    localIdentifier: "m6",
                },
            ]);
        });
    });

    describe("buildArithmeticMeasureTitleProps", () => {
        it("should correctly convert arithmetic measure definition", () => {
            const arithmeticMeasureProps = MdObjectHelper.buildArithmeticMeasureTitleProps({
                arithmeticMeasure: {
                    operator: "change",
                    measureIdentifiers: ["m1", "m2"],
                },
            });

            expect(arithmeticMeasureProps).toEqual({
                operator: "change",
                masterMeasureLocalIdentifiers: ["m1", "m2"],
            });
        });
    });

    describe("mdObjectToPivotBucketProps", () => {
        it("should convert MDO to pivot table bucket props", () => {
            const filtersFromProps: AFM.FilterItem[] = [
                {
                    relativeDateFilter: {
                        to: 0,
                        from: -3,
                        granularity: "GDC.time.quarter",
                        dataSet: {
                            uri: "/gdc/md/myproject/obj/921",
                        },
                    },
                },
            ];
            const pivotTableBucketProps = MdObjectHelper.mdObjectToPivotBucketProps(
                pivotTableMDO.visualizationObject,
                filtersFromProps,
            );

            const expectedMeasures: VisualizationInput.IMeasure[] = [
                {
                    measure: {
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "/gdc/md/myproject/obj/8172",
                                },
                            },
                        },
                        localIdentifier: "m1",
                        title: "# Accounts with AD Query",
                    },
                },
                {
                    measure: {
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: "/gdc/md/myproject/obj/8173",
                                },
                            },
                        },
                        localIdentifier: "m2",
                        title: "Measure 2",
                    },
                },
            ];

            const expectedColumns: VisualizationInput.IAttribute[] = [
                {
                    visualizationAttribute: {
                        displayForm: {
                            uri: "/gdc/md/myproject/obj/853",
                        },
                        localIdentifier: "a3",
                    },
                },
            ];

            const expectedRows: VisualizationInput.IAttribute[] = [
                {
                    visualizationAttribute: {
                        displayForm: {
                            uri: "/gdc/md/myproject/obj/851",
                        },
                        localIdentifier: "a1",
                    },
                },
                {
                    visualizationAttribute: {
                        displayForm: {
                            uri: "/gdc/md/myproject/obj/852",
                        },
                        localIdentifier: "a2",
                    },
                },
            ];

            const expectedFilters: VisualizationInput.IFilter[] = [
                {
                    relativeDateFilter: {
                        dataSet: {
                            uri: "/gdc/md/myproject/obj/921",
                        },
                        from: -3,
                        granularity: "GDC.time.quarter",
                        to: 0,
                    },
                },
            ];

            const expectedTotals: VisualizationInput.ITotal[] = [
                {
                    alias: "average",
                    attributeIdentifier: "a1",
                    measureIdentifier: "m1",
                    type: "avg",
                },
                {
                    alias: "Native total",
                    attributeIdentifier: "a2",
                    measureIdentifier: "m1",
                    type: "nat",
                },
            ];

            expect(pivotTableBucketProps.measures).toEqual(expectedMeasures);
            expect(pivotTableBucketProps.columns).toEqual(expectedColumns);
            expect(pivotTableBucketProps.rows).toEqual(expectedRows);
            expect(pivotTableBucketProps.filters).toEqual(expectedFilters);
            expect(pivotTableBucketProps.totals).toEqual(expectedTotals);
        });
    });
});
