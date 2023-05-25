// (C) 2020-2023 GoodData Corporation

import { ReferenceRecordings, ReferenceMd } from "@gooddata/reference-workspace";
import { DataViewFirstPage, dummyDataView, recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { newDataAccessMethods } from "../dataAccessMethods.js";
import { emptyDef, measureLocalId } from "@gooddata/sdk-model";
import { DataAccessConfig, DefaultDataAccessConfig } from "../../dataAccessConfig.js";
import { describe, it, expect } from "vitest";

describe("DataAccessMethods", () => {
    it("should handle empty data view", () => {
        const emptyDataView = dummyDataView(emptyDef("testWorkspace"));
        const dataAccess = newDataAccessMethods(emptyDataView);
        const series = dataAccess.series().toArray();
        const slices = dataAccess.slices().toArray();

        expect(series).toEqual([]);
        expect(slices).toEqual([]);
    });

    //
    //
    //

    describe("for data view with empty first dimension", () => {
        const DataViewWithEmptyFirstDim = recordedDataView(
            ReferenceRecordings.Scenarios.AreaChart.SingleMeasure,
        );

        it("should correctly extract data", () => {
            const dataAccess = newDataAccessMethods(DataViewWithEmptyFirstDim);
            const firstSeries = dataAccess.series().toArray()[0];

            const firstSeriesRawData = firstSeries.rawData();
            const firstSeriesDataPoints = Array.from(firstSeries);

            expect(firstSeriesDataPoints.map((dp) => dp.rawValue)).toEqual(firstSeriesRawData);
        });

        it("should return empty slices", () => {
            const dataAccess = newDataAccessMethods(DataViewWithEmptyFirstDim);
            const slices = dataAccess.slices().toArray();

            expect(slices).toEqual([]);
        });

        it("should correctly format data values", () => {
            const dataAccess = newDataAccessMethods(DataViewWithEmptyFirstDim);
            const firstSeries = dataAccess.series().toArray()[0];
            const firstSeriesDataPoints = Array.from(firstSeries);

            expect(firstSeriesDataPoints[0].rawValue).toEqual("116625456.54");
            expect(firstSeriesDataPoints[0].formattedValue()).toEqual("$116,625,456.54");
        });
    });

    //
    //
    //

    describe("for data view with two series and single-dim result", () => {
        const DataWithTwoSeriesAndNoSlices = recordedDataView(
            ReferenceRecordings.Scenarios.Headline.TwoMeasures,
        );

        it("should correctly extract data", () => {
            const dataAccess = newDataAccessMethods(DataWithTwoSeriesAndNoSlices);
            const series = dataAccess.series().toArray();

            expect(series.length).toEqual(2);

            for (const s of series) {
                const rawData = s.rawData();
                const dataPoints = Array.from(s).map((dp) => dp.rawValue);

                expect(rawData.length).toEqual(1);
                expect(dataPoints).toEqual(rawData);
            }
        });

        it("should return empty slices", () => {
            const dataAccess = newDataAccessMethods(DataWithTwoSeriesAndNoSlices);
            const slices = dataAccess.slices().toArray();

            expect(slices).toEqual([]);
        });

        it("should find series by measure", () => {
            const dataAccess = newDataAccessMethods(DataWithTwoSeriesAndNoSlices);

            expect(dataAccess.series().firstForMeasure(ReferenceMd.Amount)).toBeDefined();
            expect(dataAccess.series().firstForMeasure(ReferenceMd.Won)).toBeDefined();
        });

        it("should find all series by measure", () => {
            const dataAccess = newDataAccessMethods(DataWithTwoSeriesAndNoSlices);

            expect(Array.from(dataAccess.series().allForMeasure(ReferenceMd.Amount)).length).toEqual(1);
            expect(Array.from(dataAccess.series().allForMeasure(ReferenceMd.Won)).length).toEqual(1);
        });
    });

    //
    //
    //

    describe("for data with scopes series and empty slice dim", () => {
        const DataWithWithScopedSeriesAndNoSlices = recordedDataView(
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithColumnAttribute,
            DataViewFirstPage,
        );

        it("should correctly extract scoped series", () => {
            const dataAccess = newDataAccessMethods(DataWithWithScopedSeriesAndNoSlices);
            const series = dataAccess.series().toArray();

            expect(series.length).toEqual(4);
        });

        it("should correctly extract data", () => {
            const dataAccess = newDataAccessMethods(DataWithWithScopedSeriesAndNoSlices);

            for (const s of dataAccess.series()) {
                const dataPoints = Array.from(s);
                const rawData = s.rawData();

                expect(dataPoints.length).toEqual(1);
                expect(dataPoints[0].sliceDesc).not.toBeDefined();
                expect(dataPoints.map((dp) => dp.rawValue)).toEqual(rawData);
            }
        });

        it("should return empty slices", () => {
            const dataAccess = newDataAccessMethods(DataWithWithScopedSeriesAndNoSlices);
            const slices = dataAccess.slices().toArray();

            expect(slices).toEqual([]);
        });
    });

    describe("for data with scoped series and slices", () => {
        const DataViewWithSeriesAndSlices = recordedDataView(
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresWithRowAndColumnAttributes,
            DataViewFirstPage,
        );

        it("should correctly extract scoped series", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);
            const series = dataAccess.series().toArray();

            expect(series.length).toEqual(4);
        });

        it("should correctly extract slices", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);
            const slices = dataAccess.slices().toArray();

            expect(slices.length).toEqual(6);
        });

        it("should correctly extract data for series", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);

            for (const s of dataAccess.series()) {
                const dataPoints = Array.from(s);
                const rawData = s.rawData();

                expect(dataPoints.length).toEqual(6);
                expect(dataPoints.map((dp) => dp.rawValue)).toEqual(rawData);
                expect({
                    series: `${s.scopeTitles().join(" > ")} > ${s.measureTitle()}`,
                    slices: dataPoints.map((slice) => slice.sliceDesc!.sliceTitles()).join("|"),
                    rawData,
                }).toMatchSnapshot();
            }
        });
    });

    describe("for data with scoped series and slices with totals", () => {
        const DataViewWithSeriesAndSlices = recordedDataView(
            ReferenceRecordings.Scenarios.PivotTable.TwoMeasuresAndMultipleSubtotals,
            DataViewFirstPage,
        );

        it("should correctly extract scoped series", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);
            const series = dataAccess.series().toArray();

            expect(series.length).toEqual(8);
        });

        it("should correctly extract slices", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);
            const slices = dataAccess.slices().toArray();

            expect(slices.length).toEqual(30);
        });

        it("should correctly extract data for series", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);

            for (const s of dataAccess.series()) {
                const dataPoints = Array.from(s);
                const rawData = s.rawData();

                expect(dataPoints.length).toEqual(30);
                expect(dataPoints.map((dp) => dp.rawValue)).toEqual(rawData);
                expect({
                    series: `${s.scopeTitles().join(" > ")} > ${s.measureTitle()}`,
                    slices: dataPoints.map((slice) => slice.sliceDesc!.sliceTitles()).join("|"),
                    rawData,
                }).toMatchSnapshot();
            }
        });

        it("should translate headers", () => {
            const customConfig: DataAccessConfig = {
                ...DefaultDataAccessConfig,
                headerTranslator: (value: string | null) => `__${value}`,
            };

            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices, customConfig);
            const series = dataAccess.series().toArray();
            const slices = dataAccess.slices().toArray();

            const firstSeries = series[0];
            const firstSlice = slices[0];

            expect(firstSeries.scopeTitles()[0]).toMatch(/__.*/);
            expect(firstSlice.sliceTitles()[0]).toMatch(/__.*/);
        });

        it("should find series for measure", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);

            expect(dataAccess.series().firstForMeasure(ReferenceMd.Amount)).toBeDefined();
            expect(dataAccess.series().firstForMeasure(ReferenceMd.Won)).toBeDefined();
        });

        it("should find all series for measure", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);

            expect(Array.from(dataAccess.series().allForMeasure(ReferenceMd.Amount)).length).toEqual(4);

            for (const s of dataAccess.series().allForMeasure(ReferenceMd.Amount)) {
                expect(measureLocalId(s.descriptor.measureDefinition)).toEqual(
                    measureLocalId(ReferenceMd.Amount),
                );
            }

            expect(Array.from(dataAccess.series().allForMeasure(ReferenceMd.Won)).length).toEqual(4);

            for (const s of dataAccess.series().allForMeasure(ReferenceMd.Won)) {
                expect(measureLocalId(s.descriptor.measureDefinition)).toEqual(
                    measureLocalId(ReferenceMd.Won),
                );
            }
        });
    });
});
