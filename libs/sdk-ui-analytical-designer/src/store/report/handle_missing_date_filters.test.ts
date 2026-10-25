// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { dateAttributeIdToSdkGranularity } from "@gooddata/sdk-backend-tiger";
import {
    type IFilter,
    type IInsight,
    type IMeasure,
    type IMeasureFilter,
    idRef,
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newBucket,
    newMeasure,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    uriRef,
} from "@gooddata/sdk-model";

import { type IDateDatasetsMeta } from "../../models/date_datasets_meta.js";
import { type IDateDatasetsMetaItem } from "../../models/date_datasets_meta_item.js";
import { newInsight } from "../../tests/insightMocking.test.helpers.js";
import { type IDateDatasetAttribute } from "../../typings/dataset_attribute.js";
import { type IMissingDateFilterItem } from "../../typings/report.js";

import {
    MissingInsightItemsError,
    findMissingDateFilterItems,
    isMissingInsightItemsError,
} from "./handle_missing_date_filters.js";

const DATASET = "estimated_delivery_date";
const OTHER_DATASET = "estimated_delivery_date_fiscal";
const TITLES: Record<string, string> = {
    [DATASET]: "Estimated delivery date",
    [OTHER_DATASET]: "Estimated delivery date fiscal",
};

const missingMinuteOfHour: IMissingDateFilterItem = {
    datasetTitle: "Estimated delivery date",
    identifier: `${DATASET}.minuteOfHour`,
    granularity: "GDC.time.minute_in_hour",
};
const missingSecondOfMinute: IMissingDateFilterItem = {
    datasetTitle: "Estimated delivery date",
    identifier: `${DATASET}.secondOfMinute`,
    granularity: "GDC.time.second_in_minute",
};
const missingHour: IMissingDateFilterItem = {
    datasetTitle: "Estimated delivery date",
    identifier: DATASET,
    granularity: "GDC.time.hour",
};

const find = (insight: IInsight, dateDatasetsMeta: IDateDatasetsMeta | undefined) =>
    findMissingDateFilterItems(insight, dateDatasetsMeta, dateAttributeIdToSdkGranularity);

const dateAttribute = (identifier: string, dateType: string): IDateDatasetAttribute =>
    ({
        ref: idRef(identifier, "attribute"),
        dfRef: idRef(identifier, "displayForm"),
        dfIdentifier: identifier,
        dateType,
        displayForms: [{ id: identifier, ref: idRef(identifier, "displayForm"), title: identifier, uri: "" }],
    }) as unknown as IDateDatasetAttribute;

const dateDataset = (identifier: string, attributes: IDateDatasetAttribute[]): IDateDatasetsMetaItem =>
    ({
        identifier,
        title: TITLES[identifier],
        ref: idRef(identifier, "dataSet"),
        attributes,
    }) as unknown as IDateDatasetsMetaItem;

const meta: IDateDatasetsMeta = {
    items: [
        dateDataset(DATASET, [
            dateAttribute(`${DATASET}.hourOfDay`, "GDC.time.hour_in_day"),
            dateAttribute(`${DATASET}.year`, "GDC.time.year"),
        ]),
        // a dataset whose identifier extends the first one: its labels must not be claimed by the first
        dateDataset(OTHER_DATASET, [dateAttribute(`${OTHER_DATASET}.year`, "GDC.time.year")]),
    ],
};

const label = (identifier: string) => idRef(identifier, "displayForm");

const orphanAll = newNegativeAttributeFilter(label(`${DATASET}.minuteOfHour`), [], "orphan-all");
const orphanSelection = newNegativeAttributeFilter(
    label(`${DATASET}.secondOfMinute`),
    ["00", "01"],
    "orphan-sel",
);
const liveAdditional = newPositiveAttributeFilter(label(`${DATASET}.hourOfDay`), ["10"], "live-hour");
const otherDatasetLive = newPositiveAttributeFilter(label(`${OTHER_DATASET}.year`), ["2026"], "other-year");
const regularAttribute = newPositiveAttributeFilter(label("region"), ["East"], "region");
const mainDate = newRelativeDateFilter(idRef(DATASET, "dataSet"), "GDC.time.year", -1, 0, "main-date");
const hourDate = newRelativeDateFilter(idRef(DATASET, "dataSet"), "GDC.time.hour", -3, 0, "hour-date");
const unknownDatasetDate = newRelativeDateFilter(
    idRef("unknown_date", "dataSet"),
    "GDC.time.hour",
    -3,
    0,
    "unk",
);
const absoluteDate = newAbsoluteDateFilter(idRef(DATASET, "dataSet"), "2026-01-01", "2026-01-31", "abs-date");

const measureWith = (localId: string, filters: IMeasureFilter[]) =>
    newMeasure(idRef("revenue", "measure"), (m) => m.localId(localId).filters(...filters));

const insightWith = (filters: IFilter[], measures: IMeasure[] = []): IInsight =>
    newInsight("local:table", "insight-id", "/insight-uri", (i) =>
        i.filters(filters).buckets(measures.length ? [newBucket("measures", ...measures)] : []),
    );

describe("findMissingDateFilterItems", () => {
    it("reports nothing when the meta holds no date datasets", () => {
        const insight = insightWith([orphanAll, hourDate]);

        expect(find(insight, undefined)).toEqual([]);
        expect(find(insight, { items: [] })).toEqual([]);
    });

    it("reports nothing when every filter resolves", () => {
        const insight = insightWith([
            mainDate,
            absoluteDate,
            liveAdditional,
            otherDatasetLive,
            regularAttribute,
        ]);

        expect(find(insight, meta)).toEqual([]);
    });

    it("reports the labels of additional date filters whose attribute is gone, All and selection alike", () => {
        const insight = insightWith([mainDate, orphanAll, liveAdditional, orphanSelection, regularAttribute]);

        expect(find(insight, meta)).toEqual([missingMinuteOfHour, missingSecondOfMinute]);
    });

    it("reports a relative date filter whose granularity the dataset no longer has", () => {
        const insight = insightWith([hourDate, absoluteDate, unknownDatasetDate]);

        expect(find(insight, meta)).toEqual([missingHour]);
    });

    it("never reports an All time date filter, with or without empty values handling", () => {
        const allTime = newAllTimeFilter(idRef(DATASET, "dataSet"), "all-time", "exclude");
        const metricAllTime = newAllTimeFilter(idRef(DATASET, "dataSet"), "metric-all-time", "only");
        const insight = insightWith([allTime], [measureWith("m1", [metricAllTime])]);

        expect(find(insight, meta)).toEqual([]);
    });

    it("reports the missing items of metric date filters", () => {
        const measure = measureWith("m1", [hourDate, orphanSelection, liveAdditional, regularAttribute]);
        const insight = insightWith([mainDate], [measure]);

        expect(find(insight, meta)).toEqual([missingHour, missingSecondOfMinute]);
    });

    it("reports an item referenced from several filters once, in first-met order", () => {
        const measure = measureWith("m1", [orphanAll, hourDate]);
        const insight = insightWith([orphanAll], [measure]);

        expect(find(insight, meta)).toEqual([missingMinuteOfHour, missingHour]);
    });

    it("cannot tie a uri label to a date dataset, so it does not check it", () => {
        const uriLabel = newNegativeAttributeFilter(
            uriRef(`/gdc/md/ws/obj/${DATASET}.minuteOfHour`),
            [],
            "uri",
        );

        expect(find(insightWith([uriLabel]), meta)).toEqual([]);
    });

    it("reports a label whose granularity cannot be told without a granularity", () => {
        const oddLabel = newNegativeAttributeFilter(label(`${DATASET}.customLabel`), [], "odd");

        expect(find(insightWith([oddLabel]), meta)).toEqual([
            { datasetTitle: "Estimated delivery date", identifier: `${DATASET}.customLabel` },
        ]);
    });

    it("ignores a regular attribute filter on an unknown label", () => {
        const unknownRegular = newPositiveAttributeFilter(label("deleted_label"), ["x"], "deleted");

        expect(find(insightWith([unknownRegular]), meta)).toEqual([]);
    });

    it("attributes a label to the longest matching date dataset", () => {
        const orphanOfOther = newNegativeAttributeFilter(
            label(`${OTHER_DATASET}.minuteOfHour`),
            [],
            "other-orphan",
        );

        expect(find(insightWith([orphanOfOther]), meta)).toEqual([
            {
                datasetTitle: "Estimated delivery date fiscal",
                identifier: `${OTHER_DATASET}.minuteOfHour`,
                granularity: "GDC.time.minute_in_hour",
            },
        ]);
    });
});

describe("MissingInsightItemsError", () => {
    it("carries the missing items and is recognized by its guard", () => {
        const error = new MissingInsightItemsError([missingMinuteOfHour, missingHour]);

        expect(error.missingItems).toEqual([missingMinuteOfHour, missingHour]);
        expect(error.message).toContain(`${DATASET}.minuteOfHour`);
        expect(isMissingInsightItemsError(error)).toBe(true);
        expect(isMissingInsightItemsError(new Error("other"))).toBe(false);
    });
});
