// (C) 2007-2026 GoodData Corporation

import { uriRef } from "@gooddata/sdk-model";

import { type IDateDatasets } from "../typings/datasets.js";
import { type ICatalogEntries } from "../typings/state_objects.js";

export const dateDataSets: IDateDatasets = {
    available: [
        {
            summary: "DataSet Date",
            identifier: "closed.dataset.dt",
            ref: { uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/330" },
            uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/330",
            attributes: [
                {
                    granularity: "closed.date",
                    dfRef: { uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/195" },
                    dfIdentifier: "closed.date.mmddyyyy",
                    dfUri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/195",
                    dateType: "GDC.time.date",
                    uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/192",
                    ref: uriRef("/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/192"),
                    displayForms: [],
                },
                {
                    granularity: "closed.month",
                    dfRef: { uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/219" },
                    dfIdentifier: "closed.act81lMifn6q",
                    dfUri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/219",
                    dateType: "GDC.time.month",
                    uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/218",
                    ref: uriRef("/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/218"),
                    displayForms: [],
                },
                {
                    granularity: "closed.quarter",
                    dfRef: { uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/259" },
                    dfIdentifier: "closed.aci81lMifn6q",
                    dfUri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/259",
                    dateType: "GDC.time.quarter",
                    uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/258",
                    ref: uriRef("/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/258"),
                    displayForms: [],
                },
                {
                    granularity: "closed.week",
                    dfRef: { uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/288" },
                    dfIdentifier: "closed.aaA81lMifn6q",
                    dfUri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/288",
                    dateType: "GDC.time.week_us",
                    uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/283",
                    ref: uriRef("/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/283"),
                    displayForms: [],
                },
                {
                    granularity: "closed.year",
                    dfRef: { uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/324" },
                    dfIdentifier: "closed.aag81lMifn6q",
                    dfUri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/324",
                    dateType: "GDC.time.year",
                    uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/323",
                    ref: uriRef("/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/323"),
                    displayForms: [],
                },
            ],
            title: "Date (Closed)",
            relevance: 0,
            type: "dateDataset",
            id: "closed.dataset.dt",
            isAvailable: true,
        },
    ],
    unavailable: 2,
};

export const itemCache: ICatalogEntries = {
    aaeb7jTCfexV: {
        summary: "",
        identifier: "aaeb7jTCfexV",
        uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/9211",
        format: "#,##0.00",
        title: "_Close [BOP]",
        expression:
            "Select max([/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/1148]) where [/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/1147]=[/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/2723]",
        type: "metric",
        id: "aaeb7jTCfexV",
        isAvailable: true,
    },
    "attr.owner.department": {
        dimensionUri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/1022",
        summary: "",
        identifier: "attr.owner.department",
        dfUri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/1027",
        dfIdentifier: "label.owner.department",
        uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/1026",
        granularity: "attr.owner.department",
        elementsUri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/1027/elements",
        title: "Department",
        type: "attribute",
        id: "attr.owner.department",
        isAvailable: true,
    },
    "fact.opportunitysnapshot.amount": {
        title: "Amount",
        summary: "",
        identifier: "fact.opportunitysnapshot.amount",
        uri: "/gdc/md/gnkvwnkmgilmv8uzwmhid81acf9c6j3y/obj/1144",
        type: "fact",
        id: "fact.opportunitysnapshot.amount",
        isAvailable: true,
    },
};
