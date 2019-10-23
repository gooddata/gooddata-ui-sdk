// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import {
    appendFilters,
    hasMetricDateFilters,
    isAfmExecutable,
    normalizeAfm,
    isDateFilter,
    isAttributeFilter,
    dateFiltersDataSetsMatch,
    unwrapSimpleMeasure,
    unwrapPoPMeasure,
    unwrapPreviousPeriodMeasure,
    isSimpleMeasure,
    isPoP,
    isPreviousPeriodMeasure,
    hasGlobalDateFilter,
    hasFilters,
    getGlobalDateFilters,
    getId,
    getMeasureDateFilters,
    getDateFilterDateDataSet,
    unwrapArithmeticMeasure,
    isArithmeticMeasure,
    isAttributeFilterSelectAll,
} from "../AfmUtils";
import { Granularities } from "../../constants/granularities";
import * as fixture from "../../fixtures/Afm.fixtures";

describe("AFM utils", () => {
    describe("isDateFilter", () => {
        it("should return true for valid date filter", () => {
            const relativeDateFilter: AFM.IRelativeDateFilter = {
                relativeDateFilter: {
                    dataSet: {
                        identifier: "filter",
                    },
                    from: 1,
                    to: 2,
                    granularity: Granularities.YEAR,
                },
            };
            expect(isDateFilter(relativeDateFilter)).toEqual(true);

            const absoluteDateFilter: AFM.IAbsoluteDateFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        identifier: "filter",
                    },
                    from: "2001-01-01",
                    to: "2001-02-02",
                },
            };
            expect(isDateFilter(absoluteDateFilter)).toEqual(true);
        });

        it("should return false for attribute filter", () => {
            const attributeFilter: AFM.IPositiveAttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "filter",
                    },
                    in: ["1", "2"],
                },
            };
            expect(isDateFilter(attributeFilter)).toEqual(false);
        });
    });

    describe("isAttributeFilter", () => {
        it("should return true for valid attribute filter", () => {
            const positiveAttributeFilter: AFM.IPositiveAttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "filter",
                    },
                    in: ["1", "2"],
                },
            };
            expect(isAttributeFilter(positiveAttributeFilter)).toEqual(true);

            const negativeAttributeFilter: AFM.INegativeAttributeFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "filter",
                    },
                    notIn: ["1", "2"],
                },
            };
            expect(isAttributeFilter(negativeAttributeFilter)).toEqual(true);
        });

        it("should return false for attribute filter", () => {
            const absoluteDateFilter: AFM.IAbsoluteDateFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        identifier: "filter",
                    },
                    from: "2001-01-01",
                    to: "2001-02-02",
                },
            };
            expect(isAttributeFilter(absoluteDateFilter)).toEqual(false);
        });
    });

    describe("isAttributeFilterSelectAll", () => {
        it("should return true for negative attribute filter without elements", () => {
            const negativeAttributeFilter: AFM.INegativeAttributeFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "filter",
                    },
                    notIn: [],
                },
            };
            expect(isAttributeFilterSelectAll(negativeAttributeFilter)).toEqual(true);
        });

        it("should return false for negative attribute filter with elements", () => {
            const negativeAttributeFilter: AFM.INegativeAttributeFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: "filter",
                    },
                    notIn: ["1"],
                },
            };
            expect(isAttributeFilterSelectAll(negativeAttributeFilter)).toEqual(false);
        });

        it("should return false for positive attribute filter", () => {
            const positiveAttributeFilter: AFM.IPositiveAttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: "filter",
                    },
                    in: ["1", "2"],
                },
            };
            expect(isAttributeFilterSelectAll(positiveAttributeFilter)).toEqual(false);
        });

        it("should return false for date filter", () => {
            const relativeDateFilter: AFM.IRelativeDateFilter = {
                relativeDateFilter: {
                    dataSet: {
                        identifier: "filter",
                    },
                    from: 1,
                    to: 2,
                    granularity: Granularities.YEAR,
                },
            };
            expect(isAttributeFilterSelectAll(relativeDateFilter)).toEqual(false);
        });
    });

    describe("normalizeAfm", () => {
        it("should add optional arrays - empty", () => {
            const afm: AFM.IAfm = {};
            expect(normalizeAfm(afm)).toEqual({
                measures: [],
                attributes: [],
                filters: [],
                nativeTotals: [],
            });
        });

        it("should add optional arrays - measures & filters", () => {
            const expectedAfm: AFM.IAfm = {
                attributes: [
                    {
                        localIdentifier: "a1",
                        displayForm: {
                            identifier: "a1",
                        },
                    },
                ],
                measures: [],
                filters: [],
                nativeTotals: [],
            };
            expect(
                normalizeAfm({
                    attributes: [
                        {
                            localIdentifier: "a1",
                            displayForm: {
                                identifier: "a1",
                            },
                        },
                    ],
                }),
            ).toEqual(expectedAfm);
        });

        it("should add optional arrays - attributes & filters", () => {
            const expectedAfm: AFM.IAfm = {
                measures: [
                    {
                        localIdentifier: "m1",
                        definition: {
                            measure: {
                                item: {
                                    identifier: "m1",
                                },
                            },
                        },
                    },
                ],
                attributes: [],
                filters: [],
                nativeTotals: [],
            };
            expect(
                normalizeAfm({
                    measures: [
                        {
                            localIdentifier: "m1",
                            definition: {
                                measure: {
                                    item: {
                                        identifier: "m1",
                                    },
                                },
                            },
                        },
                    ],
                }),
            ).toEqual(expectedAfm);
        });

        it("should add optional arrays - attributes & measures", () => {
            const expectedAfm: AFM.IAfm = {
                attributes: [],
                measures: [],
                filters: [
                    {
                        relativeDateFilter: {
                            dataSet: {
                                identifier: "1",
                            },
                            from: 0,
                            to: 1,
                            granularity: Granularities.YEAR,
                        },
                    },
                ],
                nativeTotals: [],
            };
            expect(
                normalizeAfm({
                    filters: [
                        {
                            relativeDateFilter: {
                                dataSet: {
                                    identifier: "1",
                                },
                                from: 0,
                                to: 1,
                                granularity: Granularities.YEAR,
                            },
                        },
                    ],
                }),
            ).toEqual(expectedAfm);
        });
    });

    describe("appendFilters", () => {
        it("should concatenate filters when all different", () => {
            const afm = {
                filters: [fixture.positiveAttributeFilter],
            };
            const attributeFilters = [fixture.negativeAttributeFilter];
            const enriched = appendFilters(afm, attributeFilters, fixture.relativeDateFilter);
            expect(enriched.filters).toEqual([
                fixture.positiveAttributeFilter,
                fixture.negativeAttributeFilter,
                fixture.relativeDateFilter,
            ]);
        });

        it("should override date filter if identifier is identical", () => {
            const afm = {
                filters: [fixture.positiveAttributeFilter, fixture.relativeDateFilter],
            };
            const attributeFilters: AFM.AttributeFilterItem[] = [];
            const enriched = appendFilters(afm, attributeFilters, fixture.relativeDateFilter);
            expect(enriched.filters).toEqual([fixture.positiveAttributeFilter, fixture.relativeDateFilter]);
        });

        it("should append date filter if ID is different", () => {
            const afm = {
                filters: [fixture.relativeDateFilter],
            };
            const attributeFilters: AFM.AttributeFilterItem[] = [];
            const enriched = appendFilters(afm, attributeFilters, fixture.absoluteDateFilter2);
            expect(enriched.filters).toEqual([fixture.absoluteDateFilter2, fixture.relativeDateFilter]);
        });

        it('should delete date filter from AFM if "All time" date filter requested', () => {
            const afm = {
                filters: [fixture.relativeDateFilter],
            };
            const enriched = appendFilters(afm, [], fixture.allTimeDateFilter);
            expect(enriched.filters).toEqual([]);
        });

        it("should add date filter to empty afm filters", () => {
            const afm: AFM.IAfm = {
                filters: [],
            };
            const enriched = appendFilters(afm, [], fixture.absoluteDateFilter1);
            expect(enriched.filters).toEqual([fixture.absoluteDateFilter1]);
        });

        it("should work without filters in afm", () => {
            const afm: AFM.IAfm = {};
            const enriched = appendFilters(afm, [], fixture.absoluteDateFilter1);
            expect(enriched.filters).toEqual([fixture.absoluteDateFilter1]);
        });

        it("should not modify afm if there are no filters", () => {
            const afm: AFM.IAfm = {};
            const expectedAfm: AFM.IAfm = {};
            const enriched = appendFilters(afm, []);
            expect(enriched).toEqual(expectedAfm);
        });

        it("should return measure value filters if only these filters are provided", () => {
            const afm: AFM.IAfm = {};
            const enriched = appendFilters(afm, [], undefined, [fixture.measureValueFilter1]);
            expect(enriched.filters).toEqual([fixture.measureValueFilter1]);
        });

        it("should return all filters merged when all types are provided", () => {
            const afm: AFM.IAfm = {
                filters: [
                    fixture.absoluteDateFilter1,
                    fixture.positiveAttributeFilter,
                    fixture.measureValueFilter1,
                ],
            };
            const enriched = appendFilters(
                afm,
                [fixture.negativeAttributeFilter],
                fixture.absoluteDateFilter2,
                [fixture.measureValueFilter2],
            );
            expect(enriched.filters).toEqual([
                fixture.positiveAttributeFilter,
                fixture.measureValueFilter1,
                fixture.negativeAttributeFilter,
                fixture.absoluteDateFilter2,
                fixture.absoluteDateFilter1,
                fixture.measureValueFilter2,
            ]);
        });
    });

    describe("dateFiltersDataSetsMatch", () => {
        it("should match same filters", () => {
            expect(dateFiltersDataSetsMatch(fixture.relativeDateFilter, fixture.allTimeDateFilter)).toEqual(
                true,
            );

            expect(dateFiltersDataSetsMatch(fixture.relativeDateFilter, fixture.absoluteDateFilter1)).toEqual(
                true,
            );
        });

        it("should detect different filters", () => {
            expect(
                dateFiltersDataSetsMatch(fixture.absoluteDateFilter1, fixture.absoluteDateFilter2),
            ).toEqual(false);
        });
    });

    describe("isAfmExecutable", () => {
        it("should be false for only filters", () => {
            const afm = {
                filters: [fixture.relativeDateFilter],
            };

            expect(isAfmExecutable(afm)).toBeFalsy();
        });

        it("should be true for at least one measure", () => {
            const afm: AFM.IAfm = {
                measures: [
                    {
                        localIdentifier: "m1",
                        definition: {
                            measure: {
                                item: {
                                    identifier: "m1",
                                },
                                aggregation: "count",
                            },
                        },
                    },
                ],
            };

            expect(isAfmExecutable(afm)).toBeTruthy();
        });

        it("should be true for at least one attribute", () => {
            const afm: AFM.IAfm = {
                attributes: [
                    {
                        localIdentifier: "a1",
                        displayForm: {
                            uri: "/gdc/project/dsdf1",
                        },
                    },
                ],
            };

            expect(isAfmExecutable(afm)).toBeTruthy();
        });
    });

    describe("unwrapSimpleMeasure", () => {
        it("should return simple measure content when simple measure is provided", () => {
            const result = unwrapSimpleMeasure(fixture.simpleMeasure);
            expect(result).toEqual({
                item: {
                    uri: "/gdc/mock/measure",
                },
            });
        });

        it("should return undefined when PoP measure is provided", () => {
            const result = unwrapSimpleMeasure(fixture.popMeasure);
            expect(result).toEqual(undefined);
        });

        it("should return undefined when previous period measure is provided", () => {
            const result = unwrapSimpleMeasure(fixture.previousPeriodMeasure);
            expect(result).toEqual(undefined);
        });

        it("should return undefined when arithmetic measure is provided", () => {
            const result = unwrapSimpleMeasure(fixture.arithmeticMeasure);
            expect(result).toEqual(undefined);
        });
    });

    describe("unwrapPoPMeasure", () => {
        it("should return undefined when simple measure is provided", () => {
            const result = unwrapPoPMeasure(fixture.simpleMeasure);
            expect(result).toEqual(undefined);
        });

        it("should return PoP measure content when PoP measure is provided", () => {
            const result = unwrapPoPMeasure(fixture.popMeasure);
            expect(result).toEqual({
                measureIdentifier: "m1",
                popAttribute: {
                    uri: "/gdc/mock/measure",
                },
            });
        });

        it("should return undefined when previous period measure is provided", () => {
            const result = unwrapPoPMeasure(fixture.previousPeriodMeasure);
            expect(result).toEqual(undefined);
        });

        it("should return undefined when arithmetic measure is provided", () => {
            const result = unwrapPoPMeasure(fixture.arithmeticMeasure);
            expect(result).toEqual(undefined);
        });
    });

    describe("unwrapPreviousPeriodMeasure", () => {
        it("should return undefined when simple measure is provided", () => {
            const result = unwrapPreviousPeriodMeasure(fixture.simpleMeasure);
            expect(result).toEqual(undefined);
        });

        it("should return undefined when PoP measure is provided", () => {
            const result = unwrapPreviousPeriodMeasure(fixture.popMeasure);
            expect(result).toEqual(undefined);
        });

        it("should return previous period measure content when previous period measure is provided", () => {
            const result = unwrapPreviousPeriodMeasure(fixture.previousPeriodMeasure);
            expect(result).toEqual({
                measureIdentifier: "m1",
                dateDataSets: [
                    {
                        dataSet: {
                            uri: "/gdc/mock/date",
                        },
                        periodsAgo: 1,
                    },
                ],
            });
        });

        it("should return undefined when arithmetic measure is provided", () => {
            const result = unwrapPreviousPeriodMeasure(fixture.arithmeticMeasure);
            expect(result).toEqual(undefined);
        });
    });

    describe("unwrapArithmeticMeasure", () => {
        it("should return undefined when simple measure is provided", () => {
            const result = unwrapArithmeticMeasure(fixture.simpleMeasure);
            expect(result).toEqual(undefined);
        });

        it("should return undefined when PoP measure is provided", () => {
            const result = unwrapArithmeticMeasure(fixture.popMeasure);
            expect(result).toEqual(undefined);
        });

        it("should return undefined when previous period measure is provided", () => {
            const result = unwrapArithmeticMeasure(fixture.previousPeriodMeasure);
            expect(result).toEqual(undefined);
        });

        it("should return arithmetic measure content when arithmetic measure is provided", () => {
            const result = unwrapArithmeticMeasure(fixture.arithmeticMeasure);
            expect(result).toEqual({
                measureIdentifiers: ["m1", "m2"],
                operator: "sum",
            });
        });
    });

    describe("isSimpleMeasure", () => {
        it("should return true when simple measure is tested", () => {
            const result = isSimpleMeasure(fixture.simpleMeasure);
            expect(result).toEqual(true);
        });

        it("should return false when pop measure is tested", () => {
            const result = isSimpleMeasure(fixture.popMeasure);
            expect(result).toEqual(false);
        });

        it("should return false when previous period measure is tested", () => {
            const result = isSimpleMeasure(fixture.previousPeriodMeasure);
            expect(result).toEqual(false);
        });

        it("should return false when arithmetic measure is tested", () => {
            const result = isSimpleMeasure(fixture.arithmeticMeasure);
            expect(result).toEqual(false);
        });
    });

    describe("isPoP", () => {
        it("should return false when simple measure is tested", () => {
            const result = isPoP(fixture.simpleMeasure);
            expect(result).toEqual(false);
        });

        it("should return true when pop measure is tested", () => {
            const result = isPoP(fixture.popMeasure);
            expect(result).toEqual(true);
        });

        it("should return false when previous period measure is tested", () => {
            const result = isPoP(fixture.previousPeriodMeasure);
            expect(result).toEqual(false);
        });

        it("should return false when arithmetic measure is tested", () => {
            const result = isPoP(fixture.arithmeticMeasure);
            expect(result).toEqual(false);
        });
    });

    describe("isPreviousPeriodMeasure", () => {
        it("should return false when simple measure is tested", () => {
            const result = isPreviousPeriodMeasure(fixture.simpleMeasure);
            expect(result).toEqual(false);
        });

        it("should return false when pop measure is tested", () => {
            const result = isPreviousPeriodMeasure(fixture.popMeasure);
            expect(result).toEqual(false);
        });

        it("should return true when previous period measure is tested", () => {
            const result = isPreviousPeriodMeasure(fixture.previousPeriodMeasure);
            expect(result).toEqual(true);
        });

        it("should return false when arithmetic measure is tested", () => {
            const result = isPreviousPeriodMeasure(fixture.arithmeticMeasure);
            expect(result).toEqual(false);
        });
    });

    describe("isArithmeticMeasure", () => {
        it("should return false when simple measure is tested", () => {
            const result = isArithmeticMeasure(fixture.simpleMeasure);
            expect(result).toEqual(false);
        });

        it("should return false when pop measure is tested", () => {
            const result = isArithmeticMeasure(fixture.popMeasure);
            expect(result).toEqual(false);
        });

        it("should return false when previous period measure is tested", () => {
            const result = isArithmeticMeasure(fixture.previousPeriodMeasure);
            expect(result).toEqual(false);
        });

        it("should return true when arithmetic measure is tested", () => {
            const result = isArithmeticMeasure(fixture.arithmeticMeasure);
            expect(result).toEqual(true);
        });
    });

    describe("hasFilters", () => {
        it("should return false when simple measure has no filters", () => {
            const result = hasFilters((fixture.metricSum.definition as AFM.ISimpleMeasureDefinition).measure);
            expect(result).toEqual(false);
        });

        it("should return true when simple measure has some filters", () => {
            const result = hasFilters(
                (fixture.metricSum4.definition as AFM.ISimpleMeasureDefinition).measure,
            );
            expect(result).toEqual(true);
        });
    });

    describe("hasGlobalDateFilter", () => {
        it("should return false when AFM has no filters", () => {
            const result = hasGlobalDateFilter(fixture.afmWithoutGlobalFilters);
            expect(result).toEqual(false);
        });

        it("should return false when AFM has only attribute filters", () => {
            const result = hasGlobalDateFilter(fixture.afmWithAttributeGlobalDateFilter);
            expect(result).toEqual(false);
        });

        it("should return true when AFM has relative date filter", () => {
            const result = hasGlobalDateFilter(fixture.afmWithRelativeGlobalDateFilter);
            expect(result).toEqual(true);
        });

        it("should return true when AFM has absolute date filter", () => {
            const result = hasGlobalDateFilter(fixture.afmWithAbsoluteGlobalDateFilter);
            expect(result).toEqual(true);
        });
    });

    describe("hasMetricDateFilters", () => {
        it("should return true if AFM contains at least one metric date filter", () => {
            const normalizedAfm = normalizeAfm(fixture.afmWithMetricDateFilter);
            const result = hasMetricDateFilters(normalizedAfm);
            expect(result).toEqual(true);
        });

        it("should return false if AFM does not contain any metric date filter", () => {
            const normalizedAfm = normalizeAfm(fixture.afmWithoutMetricDateFilters);
            const result = hasMetricDateFilters(normalizedAfm);
            expect(result).toEqual(false);
        });

        it("should return false if AFM does not contain any metric date filter and has PoP measure", () => {
            const normalizedAfm = normalizeAfm(fixture.afmWithPopMeasure);
            const result = hasMetricDateFilters(normalizedAfm);
            expect(result).toEqual(false);
        });

        it("should return false if AFM does not contain any metric date filter and has previous period measure", () => {
            const normalizedAfm = normalizeAfm(fixture.afmWithPreviousPeriodMeasure);
            const result = hasMetricDateFilters(normalizedAfm);
            expect(result).toEqual(false);
        });

        it("should return false if AFM does not contain any metric date filter and has arithmetic measure", () => {
            const normalizedAfm = normalizeAfm(fixture.afmWithArithmeticMeasure);
            const result = hasMetricDateFilters(normalizedAfm);
            expect(result).toEqual(false);
        });
    });

    describe("getGlobalDateFilters", () => {
        it("should return empty array when AFM has no filters", () => {
            const result = getGlobalDateFilters(fixture.afmWithoutGlobalFilters);
            expect(result).toEqual([]);
        });

        it("should return array with date filters when AFM has attribute and date filters", () => {
            const result = getGlobalDateFilters(fixture.afmWithAttributeAndDateGlobalFilters);
            expect(result).toEqual([fixture.relativeDateFilter, fixture.absoluteDateFilter1]);
        });
    });

    describe("getMeasureDateFilters", () => {
        it("should return empty array when no measure has a date filter", () => {
            const result = getMeasureDateFilters(fixture.afmWWithMeasuresWithoutFilters);
            expect(result).toEqual([]);
        });

        it("should return empty array when measures have only attribute filters", () => {
            const result = getMeasureDateFilters(fixture.afmWWithMeasuresWithAttributeFilters);
            expect(result).toEqual([]);
        });

        it("should return array with all date filters when measures have all kinds of filters", () => {
            const result = getMeasureDateFilters(fixture.afmWithAllMetricTypesSomeWithFilters);
            expect(result).toEqual([fixture.relativeDateFilter, fixture.absoluteDateFilter2]);
        });
    });

    describe("getId", () => {
        it("should return uri if uri object qualifier is provided", () => {
            const result = getId({
                uri: "/uri",
            });
            expect(result).toEqual("/uri");
        });

        it("should return identifier if identifier object qualifier is provided", () => {
            const result = getId({
                identifier: "id",
            });
            expect(result).toEqual("id");
        });
    });

    describe("getDateFilterDateDataSet", () => {
        it("should return data set of relative date filter", () => {
            const filter = fixture.relativeDateFilter;

            const dataSet = getDateFilterDateDataSet(filter);

            expect(dataSet).toBe(filter.relativeDateFilter.dataSet);
        });

        it("should return data set of absolute date filter", () => {
            const filter = fixture.absoluteDateFilter1;

            const dataSet = getDateFilterDateDataSet(filter);

            expect(dataSet).toBe(filter.absoluteDateFilter.dataSet);
        });

        it("should throw exception for invalid date filter", () => {
            const filter = {
                anotherDateFilter: {
                    dataSet: {
                        uri: "/gdc/md/project/obj/727",
                    },
                },
            };

            // noinspection JSValidateTypesInspection
            const getDataSet = () => getDateFilterDateDataSet(filter as any);

            expect(getDataSet).toThrow();
        });
    });
});
