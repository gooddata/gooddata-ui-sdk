// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { type IDateDatasetsMetaItem } from "../models/date_datasets_meta_item.js";
import { GRANULARITY } from "../models/granularity.js";
import { initialState } from "../reducers/initial_state.js";
import { dateDatasetsInitialState } from "../store/date_datasets/date_datasets_state.js";
import { defaultFilterBarState } from "../store/filter_bar/filter_bar_state.js";
import { seedDateDatasetsMeta } from "../tests/constants.test.helpers.js";
import {
    seedMeasureDateDatasetSelectedUri,
    seedMeasureDateDatasetStatus,
} from "../tests/measure_date_datasets.test.helpers.js";
import { withData, withRoot } from "../tests/state_builder.test.helpers.js";
import { type IDateDataset } from "../typings/datasets.js";

import { selectedDateDatasetsSelector } from "./selected_date_datasets_selector.js";

describe("selectedDateDatasetsSelector", () => {
    const activityDateDataset: IDateDataset = {
        attributes: [
            {
                dateType: GRANULARITY.DATE,
                dfRef: {
                    identifier: "activity.dfIdentifier",
                },
                dfIdentifier: "activity.dfIdentifier",
                dfUri: "activity.dfUri",
                granularity: "",
                uri: "activity.uri",
                ref: uriRef("activity.uri"),
                displayForms: [],
            },
        ],
        id: "activity.dd",
        ref: {
            identifier: "activity.dd",
        },
        identifier: "activity.dd",
        isAvailable: true,
        relevance: 10,
        title: "Activity",
        summary: "",
        type: "",
        uri: "/gdc/md/activity.dataseturi",
    };

    const closedDateDataset: IDateDataset = {
        attributes: [
            {
                dateType: GRANULARITY.DATE,
                dfRef: {
                    identifier: "closed.dfIdentifier",
                },
                dfIdentifier: "closed.dfIdentifier",
                dfUri: "closed.dfUri",
                granularity: "",
                uri: "closed.uri",
                ref: uriRef("closed.uri"),
                displayForms: [],
            },
        ],
        id: "closed.dd",
        ref: {
            identifier: "closed.dd",
        },
        identifier: "closed.dd",
        isAvailable: true,
        relevance: 9,
        title: "Closed",
        summary: "",
        type: "",
        uri: "/gdc/md/closed.dataseturi",
    };

    const globalDateDatasets = {
        available: [closedDateDataset],
        unavailable: 2,
    };

    const initialAppState = withData(
        withData(
            seedDateDatasetsMeta(initialState, {
                items: [
                    {
                        identifier: "activity.dataseturi",
                        uri: "/gdc/md/activity.dataseturi",
                        ref: uriRef("/gdc/md/activity.dataseturi"),
                        type: "dateDataset",
                        title: "Activity",
                        summary: "DataSet Date 1",
                        attributes: [],
                    },
                    {
                        identifier: "closed.dataseturi",
                        uri: "/gdc/md/closed.dataseturi",
                        ref: uriRef("/gdc/md/closed.dataseturi"),
                        type: "dateDataset",
                        title: "Closed",
                        summary: "DataSet Date 2",
                        attributes: [],
                    },
                ],
            }),
            { dateDatasets: { ...dateDatasetsInitialState, ...globalDateDatasets } },
        ),
        { filterBar: defaultFilterBarState },
    );

    it("should set map of selected measure date datasets to measureDateDatasets", () => {
        let appState = initialAppState;

        appState = seedMeasureDateDatasetStatus(appState, "m1", [closedDateDataset], 0);
        appState = seedMeasureDateDatasetSelectedUri(appState, "m1", closedDateDataset.uri);

        appState = seedMeasureDateDatasetStatus(appState, "m2", [activityDateDataset, closedDateDataset], 0);
        appState = seedMeasureDateDatasetSelectedUri(appState, "m2", activityDateDataset.uri);

        const selectedDateDatasets = selectedDateDatasetsSelector(appState);
        expect(selectedDateDatasets.measureDateDatasets).toEqual(
            new Map<string, IDateDatasetsMetaItem>([
                [
                    "m1",
                    {
                        identifier: "closed.dataseturi",
                        summary: "DataSet Date 2",
                        title: "Closed",
                        type: "dateDataset",
                        uri: "/gdc/md/closed.dataseturi",
                        ref: uriRef("/gdc/md/closed.dataseturi"),
                        attributes: [],
                    },
                ],
                [
                    "m2",
                    {
                        identifier: "activity.dataseturi",
                        summary: "DataSet Date 1",
                        title: "Activity",
                        type: "dateDataset",
                        uri: "/gdc/md/activity.dataseturi",
                        ref: uriRef("/gdc/md/activity.dataseturi"),
                        attributes: [],
                    },
                ],
            ]),
        );
    });

    // showHiddenCatalogItems routes the "available" list through getDateDatasetsFromMetaInfo, which
    // is hit before SET_DATE_DATASETS_META lands (the very first DATE_DATASETS_DATA dispatch).
    it("should return no global date datasets when unavailable items are visible and the meta is not loaded yet", () => {
        const appState = withData(
            withData(withRoot(initialState, { featureFlags: { showHiddenCatalogItems: true } as never }), {
                dateDatasets: { ...dateDatasetsInitialState, ...globalDateDatasets },
            }),
            { filterBar: defaultFilterBarState },
        );

        const selectedDateDatasets = selectedDateDatasetsSelector(appState);

        expect(selectedDateDatasets.globalDateDatasets.items).toEqual([]);
    });
});
