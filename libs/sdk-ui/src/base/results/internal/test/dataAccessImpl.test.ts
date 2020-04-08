// (C) 2020 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { DataViewFirstPage, dummyDataView, recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { newDataAccessMethods } from "../dataAccessMethods";
import { emptyDef } from "@gooddata/sdk-model";

describe("DataAccessMethods", () => {
    it("should handle empty data view", () => {
        const emptyDataView = dummyDataView(emptyDef("testWorkspace"));
        const dataAccess = newDataAccessMethods(emptyDataView);
        const series = Array.from(dataAccess.series());
        const slices = Array.from(dataAccess.slices());

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
            const firstSeries = Array.from(dataAccess.series())[0];

            const firstSeriesRawData = firstSeries.rawData();
            const firstSeriesDataPoints = Array.from(firstSeries);

            expect(firstSeriesDataPoints.map(dp => dp.rawValue)).toEqual(firstSeriesRawData);
        });

        it("should return empty slices", () => {
            const dataAccess = newDataAccessMethods(DataViewWithEmptyFirstDim);
            const slices = Array.from(dataAccess.slices());

            expect(slices).toEqual([]);
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
            const series = Array.from(dataAccess.series());

            expect(series.length).toEqual(2);

            for (const s of series) {
                const rawData = s.rawData();
                const dataPoints = Array.from(s).map(dp => dp.rawValue);

                expect(rawData.length).toEqual(1);
                expect(dataPoints).toEqual(rawData);
            }
        });

        it("should return empty slices", () => {
            const dataAccess = newDataAccessMethods(DataWithTwoSeriesAndNoSlices);
            const slices = Array.from(dataAccess.slices());

            expect(slices).toEqual([]);
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
            const series = Array.from(dataAccess.series());

            expect(series.length).toEqual(4);
        });

        it("should correctly extract data", () => {
            const dataAccess = newDataAccessMethods(DataWithWithScopedSeriesAndNoSlices);

            for (const s of dataAccess.series()) {
                const dataPoints = Array.from(s);
                const rawData = s.rawData();

                expect(dataPoints.length).toEqual(1);
                expect(dataPoints[0].sliceDesc).not.toBeDefined();
                expect(dataPoints.map(dp => dp.rawValue)).toEqual(rawData);
            }
        });

        it("should return empty slices", () => {
            const dataAccess = newDataAccessMethods(DataWithWithScopedSeriesAndNoSlices);
            const slices = Array.from(dataAccess.slices());

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
            const series = Array.from(dataAccess.series());

            expect(series.length).toEqual(4);
        });

        it("should correctly extract slices", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);
            const slices = Array.from(dataAccess.slices());

            expect(slices.length).toEqual(6);
        });

        it("should correctly extract data for series", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);

            for (const s of dataAccess.series()) {
                const dataPoints = Array.from(s);
                const rawData = s.rawData();

                expect(dataPoints.length).toEqual(6);
                expect(dataPoints.map(dp => dp.rawValue)).toEqual(rawData);
                expect({
                    series: `${s.scopeTitles().join(" > ")} > ${s.measureTitle()}`,
                    slices: dataPoints.map(slice => slice.sliceDesc.sliceTitles()).join("|"),
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
            const series = Array.from(dataAccess.series());

            expect(series.length).toEqual(8);
        });

        it("should correctly extract slices", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);
            const slices = Array.from(dataAccess.slices());

            expect(slices.length).toEqual(30);
        });

        it("should correctly extract data for series", () => {
            const dataAccess = newDataAccessMethods(DataViewWithSeriesAndSlices);

            for (const s of dataAccess.series()) {
                const dataPoints = Array.from(s);
                const rawData = s.rawData();

                expect(dataPoints.length).toEqual(30);
                expect(dataPoints.map(dp => dp.rawValue)).toEqual(rawData);
                expect({
                    series: `${s.scopeTitles().join(" > ")} > ${s.measureTitle()}`,
                    slices: dataPoints.map(slice => slice.sliceDesc.sliceTitles()).join("|"),
                    rawData,
                }).toMatchSnapshot();
            }
        });
    });
});
