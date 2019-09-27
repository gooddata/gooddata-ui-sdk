// (C) 2007-2018 GoodData Corporation
import {
    headlineWithOneMeasure,
    headlineWithOneMeasureWithIdentifier,
    headlineWithTwoMeasuresWithIdentifier,
} from "../../../../../../__mocks__/fixtures";

export const DRILL_EVENT_DATA_BY_MEASURE_URI = {
    drillContext: {
        element: "primaryValue",
        intersection: [
            {
                header: {
                    uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                    identifier: "",
                },
                id: "lostMetric",
                title: "Lost",
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
                    identifier: "af2Ewj9Re2vK",
                    uri: "",
                },
                id: "lostMetric",
                title: "Lost",
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
                    identifier: "afSEwRwdbMeQ",
                    uri: "",
                },
                id: "wonMetric",
                title: "Won",
            },
        ],
        type: "headline",
        value: "42470571.16",
    },
    dataView: headlineWithTwoMeasuresWithIdentifier.dataView,
};
