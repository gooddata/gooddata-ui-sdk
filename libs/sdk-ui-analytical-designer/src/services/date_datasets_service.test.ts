// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { type IDateDatasetsMetaItem } from "../models/date_datasets_meta_item.js";
import { initialState } from "../reducers/initial_state.js";
import { dateDatasetsInitialState } from "../store/date_datasets/date_datasets_state.js";
import {
    activityDateDataset,
    dateDataset as dateDatasetMock,
    dateDatasetRef,
    setupAppStateWithDateDatasetMeta,
} from "../tests/constants.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IDateDataset, type IDateDatasets } from "../typings/datasets.js";

import { DateDatasetsService } from "./date_datasets_service.js";

describe("DateDatasetsService", () => {
    const unavailableDateDataset: IDateDataset = {
        ...activityDateDataset,
        id: "attr.datedataset.activity",
        isAvailable: false,
        relevance: -1,
    };

    describe("getDateDatasetByRef", () => {
        it("should return available date dataset based on its ref", () => {
            const dateDatasets = {
                available: [dateDatasetRef],
                unavailable: 0,
            };
            const ref = {
                uri: "date.dim_date",
            };

            const state = withData(initialState, {
                dateDatasets: { ...dateDatasetsInitialState, ...dateDatasets },
            });

            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByRef(state, ref);
            expect(dateDataset).toEqual(dateDatasetRef);
        });

        it("should return undefined when when date dataset is not found by ref", () => {
            const dateDatasets = {
                available: [dateDatasetRef],
                unavailable: 0,
            };
            const ref = {
                uri: "unknown",
            };

            const state = withData(initialState, {
                dateDatasets: { ...dateDatasetsInitialState, ...dateDatasets },
            });

            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByRef(state, ref);
            expect(dateDataset).toBeUndefined();
        });
    });

    describe("getDateDatasetByIdentifier", () => {
        it("should return date dataset based on its identifier", () => {
            const dateDatasets = {
                available: [dateDatasetMock],
                unavailable: 0,
            };

            const state = withData(initialState, {
                dateDatasets: { ...dateDatasetsInitialState, ...dateDatasets },
            });

            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByIdentifier(
                setupAppStateWithDateDatasetMeta(state),
                dateDatasetMock.identifier,
            );
            expect(dateDataset).toEqual(dateDatasetMock);
        });

        it("should return unavailable date dataset based on its identifier if it is not available", () => {
            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByIdentifier(
                setupAppStateWithDateDatasetMeta(initialState),
                "attr.datedataset.activity",
            );
            expect(dateDataset).toEqual(unavailableDateDataset);
        });

        it("should return undefined when date dataset is not found by identifier", () => {
            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByIdentifier(
                setupAppStateWithDateDatasetMeta(initialState),
                "another.dateDataset",
            );
            expect(dateDataset).toBeUndefined();
        });

        it("should return undefined when date dataset available is empty list", () => {
            const dateDatasets: IDateDatasets = {
                available: [],
                unavailable: 0,
            };

            const state = withData(initialState, {
                dateDatasets: { ...dateDatasetsInitialState, ...dateDatasets },
            });
            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByIdentifier(
                state,
                dateDatasetMock.identifier,
            );
            expect(dateDataset).toBeUndefined();
        });
    });

    describe("getDateDatasetByUri", () => {
        it("should return date dataset based on its uri", () => {
            const dateDatasets = {
                available: [dateDatasetMock],
                unavailable: 0,
            };

            const state = withData(initialState, {
                dateDatasets: { ...dateDatasetsInitialState, ...dateDatasets },
            });
            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByUri(
                setupAppStateWithDateDatasetMeta(state),
                dateDatasetMock.uri,
            );
            expect(dateDataset).toEqual(dateDatasetMock);
        });

        it("should return unavailable date dataset based on its uri if it is not available", () => {
            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByUri(
                setupAppStateWithDateDatasetMeta(initialState),
                "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/attr.datedataset.activity",
            );
            expect(dateDataset).toEqual(unavailableDateDataset);
        });

        it("should return undefined when date dataset is not found by uri", () => {
            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByUri(
                setupAppStateWithDateDatasetMeta(initialState),
                "another.dateDatasetUri",
            );
            expect(dateDataset).toBeUndefined();
        });

        it("should return undefined when date dataset available is empty list", () => {
            const dateDatasets: IDateDatasets = {
                available: [],
                unavailable: 0,
            };

            const state = withData(initialState, {
                dateDatasets: { ...dateDatasetsInitialState, ...dateDatasets },
            });
            const dateDataset: IDateDataset = DateDatasetsService.getDateDatasetByUri(
                state,
                dateDatasetMock.uri,
            );
            expect(dateDataset).toBeUndefined();
        });
    });

    describe("getDateDatasetsFromMetaInfo", () => {
        it("should return an empty ARRAY when the meta is not loaded yet", () => {
            // the #11767 contract: the empty sentinel's KIND is part of the contract — a keyed
            // value would break every consumer that iterates the result
            const result = DateDatasetsService.getDateDatasetsFromMetaInfo({ items: [] }, []);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([]);
        });

        it("should return a list of date datasets resolved from the meta", () => {
            const metaItem: IDateDatasetsMetaItem = {
                ref: uriRef("/gdc/md/activity.dataseturi"),
                uri: "/gdc/md/activity.dataseturi",
                identifier: "activity.dataset",
                title: "Activity",
                summary: "",
                type: "dateDataset",
                attributes: [],
            };

            const result = DateDatasetsService.getDateDatasetsFromMetaInfo({ items: [metaItem] }, []);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([
                {
                    ref: { uri: "/gdc/md/activity.dataseturi" },
                    uri: "/gdc/md/activity.dataseturi",
                    id: "activity.dataset",
                    identifier: "activity.dataset",
                    title: "Activity",
                    summary: "",
                    type: "dateDataset",
                    attributes: [],
                    isAvailable: false,
                    relevance: -1,
                },
            ]);
        });
    });
});
