// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type IDateDatasetsMeta } from "../models/date_datasets_meta.js";
import { type IDateDatasetsMetaItem } from "../models/date_datasets_meta_item.js";
import { type IDateDatasets } from "../typings/datasets.js";

import { DateDatasetsMetaUtils } from "./date_datasets_meta.js";

describe("DateDatasetsMetaUtils", () => {
    describe("collectMeta", () => {
        it("should collect meta data from dateDatasets object", () => {
            const dateDataSets: IDateDatasets = {
                available: [
                    {
                        ref: idRef("activity.dataset.dt"),
                        attributes: [],
                        id: "activity.dataset.dt",
                        identifier: "activity.dataset.dt",
                        uri: "/gdc/md/TeamOneGoodSales1/obj/727",
                        type: "dateDataset",
                        title: "Date (Activity)",
                        summary: "DataSet Date",
                        isAvailable: true,
                        relevance: 0,
                    },
                ],
                unavailable: 0,
            };

            const dateDatasetsMeta = DateDatasetsMetaUtils.collectMeta(dateDataSets);

            const expectedDateDatasetsMeta: IDateDatasetsMeta = {
                items: [
                    {
                        identifier: "activity.dataset.dt",
                        uri: "/gdc/md/TeamOneGoodSales1/obj/727",
                        type: "dateDataset",
                        title: "Date (Activity)",
                        summary: "DataSet Date",
                        ref: idRef("activity.dataset.dt"),
                        attributes: [],
                    },
                ],
            };
            expect(dateDatasetsMeta).toEqual(expectedDateDatasetsMeta);
        });

        it("should return empty items when dateDatasets available are empty", () => {
            const dateDatasets: IDateDatasets = {
                available: [],
                unavailable: 0,
            };

            const dateDatasetsMeta = DateDatasetsMetaUtils.collectMeta(dateDatasets);

            const expectedDateDatasetsMeta: IDateDatasetsMeta = {
                items: [],
            };
            expect(dateDatasetsMeta).toEqual(expectedDateDatasetsMeta);
        });

        it("should return null when dateDatasets are undefined", () => {
            const dateDatasetsMeta = DateDatasetsMetaUtils.collectMeta(undefined);
            expect(dateDatasetsMeta).toEqual(null);
        });

        it("should return null when dateDatasets are null", () => {
            const dateDatasetsMeta = DateDatasetsMetaUtils.collectMeta(null);
            expect(dateDatasetsMeta).toEqual(null);
        });
    });

    describe("findDateDatasetMetaByUri", () => {
        const metaItem1: IDateDatasetsMetaItem = {
            identifier: "id1",
            uri: "/uri/1",
            type: "date",
            title: "first date dataset",
            summary: "description",
            ref: idRef("activity.dataset.dt"),
            attributes: [],
        };
        const metaItem2: IDateDatasetsMetaItem = {
            identifier: "id2",
            uri: "/uri/2",
            type: "date",
            title: "second date dataset",
            summary: "description",
            ref: idRef("activity.dataset.dt"),
            attributes: [],
        };

        it("should return undefined when provided list of meta items is null", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByUri(metaItem1.uri, null);
            expect(metaItem).toBeUndefined();
        });

        it("should return undefined when provided list of meta items is undefined", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByUri(metaItem1.uri, undefined);
            expect(metaItem).toBeUndefined();
        });

        it("should return undefined when list of meta items is provided and uri is undefined", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByUri(undefined, [
                metaItem1,
                metaItem2,
            ]);
            expect(metaItem).toBeUndefined();
        });

        it("should return undefined when dataset identified by the uri is not found in the provided list", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByUri("some-uri", [
                metaItem1,
                metaItem2,
            ]);
            expect(metaItem).toBeUndefined();
        });

        it("should return URI of dataset when dataset identified by the uri is found in the provided list", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByUri(metaItem2.uri, [
                metaItem1,
                metaItem2,
            ]);
            expect(metaItem).toEqual(metaItem2);
        });
    });

    describe("findDateDatasetMetaByRef", () => {
        const metaItem1: IDateDatasetsMetaItem = {
            identifier: "id1",
            uri: "/uri/1",
            type: "date",
            title: "first date dataset",
            summary: "description",
            ref: idRef("activity.dataset.id1"),
            attributes: [],
        };
        const metaItem2: IDateDatasetsMetaItem = {
            identifier: "id2",
            uri: "/uri/2",
            type: "date",
            title: "second date dataset",
            summary: "description",
            ref: idRef("activity.dataset.id2"),
            attributes: [],
        };

        it("should return undefined when provided list of meta items is null", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByRef(metaItem1.ref, null);
            expect(metaItem).toBeUndefined();
        });

        it("should return undefined when provided list of meta items is undefined", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByRef(metaItem1.ref, undefined);
            expect(metaItem).toBeUndefined();
        });

        it("should return undefined when list of meta items is provided and ref is undefined", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByRef(undefined, [
                metaItem1,
                metaItem2,
            ]);
            expect(metaItem).toBeUndefined();
        });

        it("should return undefined when dataset identified by the ref is not found in the provided list", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByRef({ uri: "some-uri" }, [
                metaItem1,
                metaItem2,
            ]);
            expect(metaItem).toBeUndefined();
        });

        it("should return dataset item when dataset identified by the ref is found in the provided list", () => {
            const metaItem = DateDatasetsMetaUtils.findDateDatasetMetaByRef(metaItem2.ref, [
                metaItem1,
                metaItem2,
            ]);
            expect(metaItem).toEqual(metaItem2);
        });
    });
});
