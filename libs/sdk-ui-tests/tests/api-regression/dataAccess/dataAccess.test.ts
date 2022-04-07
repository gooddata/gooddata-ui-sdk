// (C) 2020 GoodData Corporation

import { IDataView } from "@gooddata/sdk-backend-spi";
import { recordedDataViews } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade, IDataSeriesCollection, IDataSliceCollection } from "@gooddata/sdk-ui";
import { isTotal, isAttributeDescriptor } from "@gooddata/sdk-model";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

describe("DataAccess", () => {
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
