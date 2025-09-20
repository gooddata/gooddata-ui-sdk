// (C) 2020-2025 GoodData Corporation

import { flatMap } from "lodash-es";
import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { ScenarioRecording, dummyDataView, recordedDataViews } from "@gooddata/sdk-backend-mockingbird";
import { IDataView } from "@gooddata/sdk-backend-spi";

import { DataAccessDigest, createDataAccessDigest } from "../dataAccessDigest.js";

function digestSnapshot(digest: DataAccessDigest) {
    return {
        seriesIdx: digest.series?.dimIdx,
        seriesCount: digest.series?.count ?? 0,
        slicesIdx: digest.slices?.dimIdx,
        slicesCount: digest.slices?.count ?? 0,
    };
}

describe("createDataAccessDigest", () => {
    const Scenarios: Array<[string, IDataView]> = recordedDataViews(ReferenceRecordings.Recordings).map(
        (dv) => [dv.name, dv.dataView],
    );

    it.each(Scenarios)("should find slices and series for: %s", (_desc, dataView) => {
        const digest = createDataAccessDigest(dataView);

        expect(digestSnapshot(digest)).toMatchSnapshot();
    });

    const allScenarioRecordings = flatMap(Object.values(ReferenceRecordings.Scenarios), (group) =>
        Object.entries(group),
    );

    it.each(allScenarioRecordings)(
        "should handle empty data view with non empty result dimensions for %s",
        (_, { execution: { definition, executionResult } }: ScenarioRecording) => {
            const dataView = dummyDataView(definition, executionResult);
            const digest = createDataAccessDigest(dataView);

            expect(digestSnapshot(digest)).toMatchObject({ seriesCount: 0, slicesCount: 0 });
        },
    );
});
