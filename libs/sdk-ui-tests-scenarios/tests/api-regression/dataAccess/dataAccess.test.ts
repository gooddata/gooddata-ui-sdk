// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedDataViews } from "@gooddata/sdk-backend-mockingbird";
import { type IDataView } from "@gooddata/sdk-backend-spi";
import { isAttributeDescriptor, isTotal } from "@gooddata/sdk-model";
import { DataViewFacade, type IDataSeriesCollection, type IDataSliceCollection } from "@gooddata/sdk-ui";

describe.skip("DataAccess", () => {
    const Scenarios: Array<[string, IDataView]> = recordedDataViews(ReferenceRecordings.Recordings).map(
        (dv) => [dv.name, dv.dataView],
    );

    function seriesCollectionDigest(series: IDataSeriesCollection) {
        return {
            allSeries: series.count,
            measures: series.fromMeasures.length,
            attributes: series.scopingAttributes?.length,
            seriesNames: Array.from(series).map(
                (s) => `${s.scopeTitles().join(" > ")} > ${s.measureTitle()}`,
            ),
        };
    }

    function sliceCollectionDigest(slice: IDataSliceCollection) {
        return {
            allSlices: slice.count,
            attributes: slice.descriptors.filter(isAttributeDescriptor).length,
            totals: slice.descriptors.filter(isTotal).length,
            sliceNames: Array.from(slice).map((s) => `${s.sliceTitles().join(" > ")}`),
        };
    }

    it.each(Scenarios)("should correctly identify series and slices for: %s", (_desc, dataView) => {
        const dataAccess = DataViewFacade.for(dataView).data();
        const seriesDigest = seriesCollectionDigest(dataAccess.series());
        const slicesDigest = sliceCollectionDigest(dataAccess.slices());

        expect(seriesDigest.allSeries).toEqual(seriesDigest.seriesNames.length);
        expect(slicesDigest.allSlices).toEqual(slicesDigest.sliceNames.length);

        expect({
            seriesDigest,
            slicesDigest,
        }).toMatchSnapshot();
    });

    it.each(Scenarios)("should correctly extract data for series in: %s", (_desc, dataView) => {
        const dataAccess = DataViewFacade.for(dataView).data();
        const seriesCol = dataAccess.series();
        const slicesCol = dataAccess.slices();

        for (const series of seriesCol) {
            /*
             * Length of data is equal to number of slices - with one exception: if there
             * are no slices then the data still has one entry for the unsliced value.
             */
            expect(series.rawData().length).toEqual(slicesCol.count || 1);

            const valuesFromPoints = Array.from(series).map((dp) => dp.rawValue);

            expect(valuesFromPoints).toEqual(series.rawData());
        }
    });
});
