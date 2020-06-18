// (C) 2020 GoodData Corporation

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { dummyDataView, recordedDataViews } from "@gooddata/sdk-backend-mockingbird";
import { emptyDef } from "@gooddata/sdk-model";
import { createDataAccessDigest, DataAccessDigest } from "../dataAccessDigest";

function digestSnapshot(digest: DataAccessDigest) {
    return {
        seriesIdx: digest.series?.dimIdx,
        seriesCount: digest.series?.count,
        slicesIdx: digest.slices?.dimIdx,
        slicesCount: digest.slices?.count,
    };
}

describe("createDataAccessDigest", () => {
    const Scenarios: Array<[string, IDataView]> = recordedDataViews(
        ReferenceRecordings.Recordings,
    ).map((dv) => [dv.name, dv.dataView]);

    it.each(Scenarios)("should find slices and series for: %s", (_desc, dataView) => {
        const digest = createDataAccessDigest(dataView);

        expect(digestSnapshot(digest)).toMatchSnapshot();
    });

    it("should handle empty data view", () => {
        const emptyDataView = dummyDataView(emptyDef("testWorkspace"));
        const digest = createDataAccessDigest(emptyDataView);

        expect(digestSnapshot(digest)).toEqual({});
    });
});
