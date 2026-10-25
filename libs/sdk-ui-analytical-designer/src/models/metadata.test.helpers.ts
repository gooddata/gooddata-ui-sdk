// (C) 2021-2026 GoodData Corporation

import { idRef } from "@gooddata/sdk-model";

import { type IVisualization } from "../typings/bear/bearTypes.js";
import { type ICatalogEntries } from "../typings/state_objects.js";

export const visualizationWithNonDefaultUnsupportedDisplayForm: IVisualization = {
    visualizationObject: {
        content: {
            buckets: [
                {
                    items: [
                        {
                            visualizationAttribute: {
                                displayForm: {
                                    uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1071",
                                },
                                localIdentifier: "c34d73138ece49409eeddc5d346e0eec",
                            },
                        },
                    ],
                    localIdentifier: "attribute",
                },
            ],
            properties:
                '{"sortItems":[{"attributeSortItem":{"attributeIdentifier":"c34d73138ece49409eeddc5d346e0eec","direction":"asc"}}]}',
            visualizationClass: {
                uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/11",
            },
        },
        meta: {
            author: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
            category: "visualizationObject",
            contributor: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
            created: "2021-06-07 09:35:10",
            deprecated: "0",
            identifier: "aaONmXDPbeiC",
            isProduction: 1,
            summary: "",
            tags: [],
            title: "DF for KD",
            updated: "2021-06-08 07:23:49",
            uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1799",
        },
    },
};

export const visualizationWithNonDefaultSupportedDisplayForm: IVisualization = {
    visualizationObject: {
        content: {
            buckets: [
                {
                    items: [
                        {
                            visualizationAttribute: {
                                displayForm: {
                                    uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1070",
                                },
                                localIdentifier: "c34d73138ece49409eeddc5d346e0eec",
                            },
                        },
                    ],
                    localIdentifier: "attribute",
                },
            ],
            properties:
                '{"sortItems":[{"attributeSortItem":{"attributeIdentifier":"c34d73138ece49409eeddc5d346e0eec","direction":"asc"}}]}',
            visualizationClass: {
                uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/11",
            },
        },
        meta: {
            author: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
            category: "visualizationObject",
            contributor: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
            created: "2021-06-07 09:35:10",
            deprecated: "0",
            identifier: "aaONmXDPbeiC",
            isProduction: 1,
            summary: "",
            tags: [],
            title: "DF for KD",
            updated: "2021-06-08 07:23:49",
            uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1799",
        },
    },
};

export const visualizationWithNonDefaultSupportedDisplayFormOfDateItem: IVisualization = {
    visualizationObject: {
        content: {
            buckets: [
                {
                    items: [
                        {
                            visualizationAttribute: {
                                displayForm: {
                                    uri: "/gdc/md/project/obj/df_two",
                                },
                                localIdentifier: "c34d73138ece49409eeddc5d346e0eec",
                            },
                        },
                    ],
                    localIdentifier: "attribute",
                },
            ],
            properties:
                '{"sortItems":[{"attributeSortItem":{"attributeIdentifier":"c34d73138ece49409eeddc5d346e0eec","direction":"asc"}}]}',
            visualizationClass: {
                uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/11",
            },
        },
        meta: {
            author: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
            category: "visualizationObject",
            contributor: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
            created: "2021-06-07 09:35:10",
            deprecated: "0",
            identifier: "aaONmXDPbeiC",
            isProduction: 1,
            summary: "",
            tags: [],
            title: "DF for KD",
            updated: "2021-06-08 07:23:49",
            uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1799",
        },
    },
};

export const visualizationWithAttributeWithoutCachedDisplayForms: IVisualization = {
    visualizationObject: {
        content: {
            buckets: [
                {
                    items: [
                        {
                            visualizationAttribute: {
                                displayForm: {
                                    uri: "/gdc/md/project/obj/no_df_list",
                                },
                                localIdentifier: "c34d73138ece49409eeddc5d346e0eec",
                            },
                        },
                    ],
                    localIdentifier: "attribute",
                },
            ],
            properties: "{}",
            visualizationClass: {
                uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/11",
            },
        },
        meta: {
            author: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
            category: "visualizationObject",
            contributor: "/gdc/account/profile/3549d3c12c12a736e4ee3abbbb044ae1",
            created: "2021-06-07 09:35:10",
            deprecated: "0",
            identifier: "aaONmXDPbeiC",
            isProduction: 1,
            summary: "",
            tags: [],
            title: "DF for KD",
            updated: "2021-06-08 07:23:49",
            uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1799",
        },
    },
};

export const itemCache: ICatalogEntries = {
    "attr.opportunity.id": {
        dfIdentifiers: ["label.opportunity.id.name", "label.opportunity.id", "label.opportunity.id.url"],
        dfUris: [
            "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1069",
            "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1070",
            "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1071",
        ],
        identifier: "attr.opportunity.id",
        dfUri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1069",
        dfIdentifier: "label.opportunity.id.name",
        uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1068",
        displayForms: [
            {
                id: "label.opportunity.id.name",
                uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1069",
                ref: {
                    uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1069",
                },
                title: "Opportunity Name",
            },
            {
                id: "label.opportunity.id",
                uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1070",
                ref: {
                    uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1070",
                },
                title: "Opportunity",
            },
            {
                id: "label.opportunity.id.legacyGeo",
                uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1071",
                ref: {
                    uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1071",
                },
                type: "GDC.geo.ausstates.code",
                title: "SFDC URL",
            },
        ],
        dfRef: {
            uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1069",
        },
        ref: {
            uri: "/gdc/md/m0fb588l0gp4ozk9qppdudn9k9lrck8y/obj/1068",
        },
        title: "Opportunity",
        type: "attribute",
    },
    "activity.year": {
        dateType: "GDC.time.year",
        identifier: "activity.year",
        granularity: "activity.year",
        ref: {
            uri: "/gdc/md/l9lf4jjlbtp9bu4klir251sk8v8l6tsh/obj/850",
        },
        dfUri: "/gdc/md/project/obj/df_one",
        dfIdentifier: "activity.df.one",
        dfRef: {
            uri: "/gdc/md/project/obj/df_one",
        },
        uri: "/gdc/md/l9lf4jjlbtp9bu4klir251sk8v8l6tsh/obj/850",
        displayForms: [
            {
                id: "activity.df.one",
                uri: "/gdc/md/project/obj/df_one",
                ref: {
                    uri: "/gdc/md/project/obj/df_one",
                },
                title: "Year (DF 1)",
            },
            {
                id: "activity.df.two",
                uri: "/gdc/md/project/obj/df_two",
                ref: {
                    uri: "/gdc/md/project/obj/df_two",
                },
                title: "Year (DF 2)",
            },
        ],
        title: "Year (Activity)",
    },
    // the catalog conversion (utils/organized_catalog.ts) leaves displayForms undefined when the
    // catalog attribute carries none — readers must not assume the list is present
    "attr.without.dfs": {
        identifier: "attr.without.dfs",
        uri: "/gdc/md/project/obj/2000",
        ref: {
            uri: "/gdc/md/project/obj/2000",
        },
        dfUri: "/gdc/md/project/obj/no_df_list",
        dfIdentifier: "label.without.dfs",
        dfRef: {
            uri: "/gdc/md/project/obj/no_df_list",
        },
        title: "Attribute Without Cached DFs",
        type: "attribute",
    },
    // a REGULAR attribute sharing the computed attribute's identifier below. The backend forbids
    // that collision today, but the cache namespaces are kept apart precisely so it cannot decide
    // which entry a saved reference resolves to - the lookups must answer off the ref's own type.
    "attribute.rep_performance": {
        identifier: "rep_performance",
        ref: idRef("rep_performance", "attribute"),
        dfRef: idRef("rep_performance.name", "displayForm"),
        dfIdentifier: "rep_performance.name",
        title: "Rep Performance (plain attribute)",
        type: "attribute",
    },
    // a computed attribute lives in its OWN cache namespace (models/item_cache_lookup.ts)
    "computedAttribute.rep_performance": {
        identifier: "rep_performance",
        ref: idRef("rep_performance", "computedAttribute"),
        dfRef: idRef("rep_performance", "computedAttribute"),
        dfIdentifier: "rep_performance",
        title: "Rep Performance",
        type: "computedAttribute",
    },
};
