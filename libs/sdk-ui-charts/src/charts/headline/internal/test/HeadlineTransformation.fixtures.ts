// (C) 2007-2020 GoodData Corporation
import {
    headlineWithOneMeasure,
    headlineWithOneMeasureWithIdentifier,
    headlineWithTwoMeasuresWithIdentifier,
} from "../../../../../__mocks__/fixtures.js";
import { uriRef } from "@gooddata/sdk-model";

export const DRILL_EVENT_DATA_BY_MEASURE_URI = {
    drillContext: {
        element: "primaryValue",
        intersection: [
            {
                header: {
                    measureHeaderItem: {
                        format: "#,##0.00",
                        identifier: "af2Ewj9Re2vK",
                        localIdentifier: "lostMetric",
                        name: "Lost",
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        ref: uriRef("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283"),
                    },
                },
            },
        ],
        type: "headline",
        value: "9011389.956",
    },
    dataView: headlineWithOneMeasure.dataView,
};

export const DRILL_EVENT_DATA_BY_MEASURE_IDENTIFIER = {
    drillContext: {
        element: "primaryValue",
        intersection: [
            {
                header: {
                    measureHeaderItem: {
                        format: "#,##0.00",
                        identifier: "af2Ewj9Re2vK",
                        localIdentifier: "lostMetric",
                        name: "Lost",
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        ref: uriRef("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283"),
                    },
                },
            },
        ],
        type: "headline",
        value: "9011389.956",
    },
    dataView: headlineWithOneMeasureWithIdentifier.dataView,
};

export const DRILL_EVENT_DATA_FOR_SECONDARY_ITEM = {
    drillContext: {
        element: "secondaryValue",
        intersection: [
            {
                header: {
                    measureHeaderItem: {
                        format: "#,##0.00",
                        identifier: "afSEwRwdbMeQ",
                        localIdentifier: "wonMetric",
                        name: "Won",
                        uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284",
                        ref: uriRef("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284"),
                    },
                },
            },
        ],
        type: "headline",
        value: "42470571.16",
    },
    dataView: headlineWithTwoMeasuresWithIdentifier.dataView,
};
