// (C) 2023 GoodData Corporation
import { IDashboardLayout } from "@gooddata/sdk-model";

export const dashboardLayout: IDashboardLayout = {
    type: "IDashboardLayout",
    sections: [
        {
            type: "IDashboardLayoutSection",
            header: {},
            items: [
                {
                    type: "IDashboardLayoutItem",
                    widget: {
                        type: "insight",
                        insight: {
                            identifier: "de6092cf-d243-4987-918b-8aac3ecd26cc",
                            type: "insight",
                        },
                        ignoreDashboardFilters: [],
                        drills: [
                            {
                                transition: "in-place",
                                origin: {
                                    type: "drillFromMeasure",
                                    measure: {
                                        localIdentifier: "3502d14f99e845d6a9b6d41ad7f434e8",
                                    },
                                },
                                type: "drillToDashboard",
                                target: {
                                    identifier: "51ab79db-d7aa-44fe-ba93-404d83f071d3",
                                    type: "analyticalDashboard",
                                },
                            },
                            {
                                transition: "new-window",
                                origin: {
                                    type: "drillFromMeasure",
                                    measure: {
                                        localIdentifier: "0194ba717d1e41e3ba6c4a3302b9a74a",
                                    },
                                },
                                type: "drillToCustomUrl",
                                target: {
                                    url: "https://googgle.com",
                                },
                            },
                        ],
                        title: "Pie chart multiple measures",
                        description: "",
                        dateDataSet: {
                            identifier: "dt_oppcreated_timestamp",
                            type: "dataSet",
                        },
                        ref: {
                            identifier: "de6092cf-d243-4987-918b-8aac3ecd26cc_widget-0",
                        },
                        uri: "de6092cf-d243-4987-918b-8aac3ecd26cc_widget-0",
                        identifier: "de6092cf-d243-4987-918b-8aac3ecd26cc_widget-0",
                        properties: {},
                    },
                    size: {
                        xl: {
                            gridHeight: 22,
                            gridWidth: 8,
                        },
                    },
                },
                {
                    type: "IDashboardLayoutItem",
                    widget: {
                        type: "insight",
                        insight: {
                            identifier: "75e08348-d27f-42b8-a360-41bee971fb6d",
                            type: "insight",
                        },
                        ignoreDashboardFilters: [],
                        drills: [
                            {
                                localIdentifier: "b4c6999557164163a9e0e75ec74cb8db",
                                transition: "in-place",
                                origin: {
                                    type: "drillFromMeasure",
                                    measure: {
                                        localIdentifier: "ebf774d29af346b2915d72e74b6527a5",
                                    },
                                },
                                type: "drillToDashboard",
                                target: {
                                    identifier: "51ab79db-d7aa-44fe-ba93-404d83f071d3",
                                    type: "analyticalDashboard",
                                },
                            },
                            {
                                localIdentifier: "f524468b249440f5b446a5f354d9df07",
                                transition: "in-place",
                                origin: {
                                    type: "drillFromAttribute",
                                    attribute: {
                                        localIdentifier: "7d5bbdfea48a419d92e14444fa47bdb5",
                                    },
                                },
                                type: "drillToDashboard",
                                target: {
                                    identifier: "c4e4916e-ccc2-46d1-8202-8321249ec2a3",
                                    type: "analyticalDashboard",
                                },
                            },
                            {
                                transition: "pop-up",
                                origin: {
                                    type: "drillFromAttribute",
                                    attribute: {
                                        localIdentifier: "7d5bbdfea48a419d92e14444fa47bdb5",
                                    },
                                },
                                type: "drillToInsight",
                                target: {
                                    identifier: "87e5c951-0ae6-4a71-a38d-843457bdfc0b",
                                    type: "insight",
                                },
                            },
                            {
                                localIdentifier: "75ba0281ecef4c4e8f874cd1642965d0",
                                transition: "new-window",
                                origin: {
                                    type: "drillFromAttribute",
                                    attribute: {
                                        localIdentifier: "fa674d6055324a23bceb93f624a4844b",
                                    },
                                },
                                type: "drillToAttributeUrl",
                                target: {
                                    hyperlinkDisplayForm: {
                                        identifier: "f_owner.region_id.regionhyperlink",
                                        type: "displayForm",
                                    },
                                    displayForm: {
                                        identifier: "f_owner.region_id",
                                        type: "displayForm",
                                    },
                                },
                            },
                        ],
                        title: "Dependency wheel chart",
                        description: "",
                        dateDataSet: {
                            identifier: "dt_closedate_timestamp",
                            type: "dataSet",
                        },
                        properties: {},
                        ref: {
                            identifier: "75e08348-d27f-42b8-a360-41bee971fb6d_widget-1",
                        },
                        uri: "75e08348-d27f-42b8-a360-41bee971fb6d_widget-1",
                        identifier: "75e08348-d27f-42b8-a360-41bee971fb6d_widget-1",
                    },
                    size: {
                        xl: {
                            gridHeight: 31,
                            gridWidth: 11,
                        },
                    },
                },
            ],
        },
    ],
};
