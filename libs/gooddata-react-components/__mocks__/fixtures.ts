// (C) 2007-2019 GoodData Corporation
import { VisualizationObject, VisualizationClass, AFM } from "@gooddata/typings";
import IVisualizationClassWrapped = VisualizationClass.IVisualizationClassWrapped;
import IVisualization = VisualizationObject.IVisualization;

export const dummyMeasureGroup = {
    items: [
        {
            measureHeaderItem: {
                localIdentifier: "m1",
                name: "dummyName1",
                format: "#.##x",
            },
        },
        {
            measureHeaderItem: {
                localIdentifier: "m2",
                name: "dummyName2",
                format: "#.##x",
            },
        },
    ],
};

export const measures: VisualizationObject.IMeasure[] = [
    {
        measure: {
            localIdentifier: "m1",
            title: "# Logged-in Users",
            definition: {
                measureDefinition: {
                    item: {
                        uri: "/gdc/md/myproject/obj/3276",
                    },
                    filters: [],
                },
            },
        },
    },
    {
        measure: {
            localIdentifier: "m2",
            title: "# Users Opened AD",
            definition: {
                measureDefinition: {
                    item: {
                        uri: "/gdc/md/myproject/obj/1995",
                    },
                    filters: [],
                },
            },
        },
    },
];

export const pivotTableMDO: IVisualization = {
    visualizationObject: {
        content: {
            visualizationClass: {
                uri: "/gdc/md/myproject/obj/table",
            },
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                title: "# Accounts with AD Query",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: "/gdc/md/myproject/obj/8172",
                                        },
                                    },
                                },
                            },
                        },
                        {
                            measure: {
                                localIdentifier: "m2",
                                title: "Measure 2",
                                definition: {
                                    measureDefinition: {
                                        item: {
                                            uri: "/gdc/md/myproject/obj/8173", // made up uri
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
                {
                    localIdentifier: "attribute",
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: "a1",
                                displayForm: {
                                    uri: "/gdc/md/myproject/obj/851", // made up uri
                                },
                            },
                        },
                        {
                            visualizationAttribute: {
                                localIdentifier: "a2",
                                displayForm: {
                                    uri: "/gdc/md/myproject/obj/852", // made up uri
                                },
                            },
                        },
                    ],
                    totals: [
                        {
                            measureIdentifier: "m1",
                            type: "avg",
                            alias: "average",
                            attributeIdentifier: "a1",
                        },
                        {
                            measureIdentifier: "m1",
                            type: "nat",
                            alias: "Native total",
                            attributeIdentifier: "a2",
                        },
                    ],
                },
                {
                    localIdentifier: "columns",
                    items: [
                        {
                            visualizationAttribute: {
                                localIdentifier: "a3",
                                displayForm: {
                                    uri: "/gdc/md/myproject/obj/853", // made up uri
                                },
                            },
                        },
                    ],
                },
            ],
            filters: [
                {
                    relativeDateFilter: {
                        to: 0,
                        from: -3,
                        granularity: "GDC.time.quarter",
                        dataSet: {
                            uri: "/gdc/md/myproject/obj/921",
                        },
                    },
                },
            ],
            properties: JSON.stringify({
                sortItems: [
                    {
                        attributeSortItem: {
                            direction: "asc",
                            attributeIdentifier: "a1",
                        },
                    },
                    // To make sure sortItems are typed even in stringify and to satisfy linter
                ] as AFM.IAttributeSortItem[],
            }),
        },
        meta: {
            author: "/gdc/account/profile/johndoe",
            uri: "/gdc/md/myproject/obj/2",
            tags: "",
            created: new Date("2015-05-23T09:24:41Z"),
            identifier: "aa5CD0OcfSpg",
            deprecated: false,
            summary: "",
            isProduction: true,
            title: "Measure over time (table)",
            category: "visualizationObject",
            contributor: "/gdc/account/profile/johndoe",
        },
    },
};

export const visualizationObjects: IVisualization[] = [
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/column",
                },
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: measures,
                    },
                    {
                        localIdentifier: "view",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "a1",
                                    displayForm: {
                                        uri: "/gdc/md/myproject/obj/851",
                                    },
                                },
                            },
                        ],
                    },
                ],
                filters: [
                    {
                        relativeDateFilter: {
                            from: -3,
                            to: 0,
                            granularity: "GDC.time.quarter",
                            dataSet: {
                                uri: "/gdc/md/myproject/obj/921",
                            },
                        },
                    },
                ],
                properties: JSON.stringify({
                    controls: {
                        grid: {
                            enabled: true,
                        },
                    },
                }),
            },
            meta: {
                isProduction: true,
                summary: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aagAVA3ffizU",
                author: "/gdc/account/profile/johndoe",
                uri: "/gdc/md/myproject/obj/1",
                deprecated: false,
                title: "Measure over time",
                tags: "",
                contributor: "/gdc/account/profile/johndoe",
                category: "visualizationObject",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/table",
                },
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier: "m1",
                                    title: "# Accounts with AD Query",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/8172",
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "attribute",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "a1",
                                    displayForm: {
                                        uri: "/gdc/md/myproject/obj/851",
                                    },
                                },
                            },
                        ],
                        totals: [
                            {
                                measureIdentifier: "m1",
                                type: "avg",
                                alias: "average",
                                attributeIdentifier: "a1",
                            },
                        ],
                    },
                ],
                filters: [
                    {
                        relativeDateFilter: {
                            to: 0,
                            from: -3,
                            granularity: "GDC.time.quarter",
                            dataSet: {
                                uri: "/gdc/md/myproject/obj/921",
                            },
                        },
                    },
                ],
                properties: JSON.stringify({
                    sortItems: [
                        {
                            attributeSortItem: {
                                direction: "asc",
                                attributeIdentifier: "a1",
                            },
                        },
                    ],
                }),
            },
            meta: {
                author: "/gdc/account/profile/johndoe",
                uri: "/gdc/md/myproject/obj/2",
                tags: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aa5CD0OcfSpg",
                deprecated: false,
                summary: "",
                isProduction: true,
                title: "Measure over time (table)",
                category: "visualizationObject",
                contributor: "/gdc/account/profile/johndoe",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/column",
                },
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier: "m1",
                                    title: "# Logged-in Users",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/3276",
                                            },
                                            filters: [],
                                        },
                                    },
                                },
                            },
                        ],
                    },
                ],
                filters: [],
            },
            meta: {
                isProduction: true,
                summary: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aagAVA3ffizU",
                author: "/gdc/account/profile/johndoe",
                uri: "/gdc/md/myproject/obj/onemeasure",
                deprecated: false,
                title: "One measure",
                tags: "",
                contributor: "/gdc/account/profile/johndoe",
                category: "visualizationObject",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/column",
                },
                buckets: [
                    {
                        localIdentifier: "attribute",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "a1",
                                    displayForm: {
                                        uri: "/gdc/md/myproject/obj/4001",
                                    },
                                },
                            },
                        ],
                    },
                ],
                filters: [],
            },
            meta: {
                isProduction: true,
                summary: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aagAVA3ffizU",
                author: "/gdc/account/profile/johndoe",
                uri: "/gdc/md/myproject/obj/oneattribute",
                deprecated: false,
                title: "One attribute",
                tags: "",
                contributor: "/gdc/account/profile/johndoe",
                category: "visualizationObject",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/table",
                },
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier: "m1",
                                    title: "# Accounts with AD Query",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/8172",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1_pop",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m1",
                                            popAttribute: {
                                                uri: "/gdc/md/myproject/obj/1514",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1_previous_period",
                                    definition: {
                                        previousPeriodMeasure: {
                                            measureIdentifier: "m1",
                                            dateDataSets: [
                                                {
                                                    dataSet: {
                                                        uri: "/gdc/md/myproject/obj/921",
                                                    },
                                                    periodsAgo: 1,
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "attribute",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "a1",
                                    displayForm: {
                                        uri: "/gdc/md/myproject/obj/1515",
                                    },
                                },
                            },
                        ],
                    },
                ],
                properties: JSON.stringify({
                    sortItems: [
                        {
                            attributeSortItem: {
                                direction: "asc",
                                attributeIdentifier: "a1",
                            },
                        },
                    ],
                }),
            },
            meta: {
                author: "/gdc/account/profile/johndoe",
                uri: "/gdc/md/myproject/obj/2",
                tags: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aa5CD0OcfSpg",
                deprecated: false,
                summary: "",
                isProduction: true,
                title: "Over time comparison",
                category: "visualizationObject",
                contributor: "/gdc/account/profile/johndoe",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062",
                                    format: "#,##0.00",
                                    title: "Sum of Email Clicks",
                                    definition: {
                                        measureDefinition: {
                                            aggregation: "sum",
                                            item: {
                                                uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15428",
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "secondary_measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062_pop",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062",
                                            popAttribute: {
                                                uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15330",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062_previous_period",
                                    definition: {
                                        previousPeriodMeasure: {
                                            measureIdentifier: "fdd41e4ca6224cd2b5ecce15fdabf062",
                                            dateDataSets: [
                                                {
                                                    dataSet: {
                                                        uri:
                                                            "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/921",
                                                    },
                                                    periodsAgo: 1,
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                    },
                ],
                filters: [
                    {
                        absoluteDateFilter: {
                            to: "2017-12-31",
                            from: "2014-01-01",
                            dataSet: {
                                uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15337",
                            },
                        },
                    },
                ],
                visualizationClass: {
                    uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/808936",
                },
            },
            meta: {
                author: "/gdc/account/profile/26728eacad349ba6c4c04c5e5cc59437",
                uri: "/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/809028",
                tags: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aadQOoKTbq5E",
                deprecated: false,
                summary: "",
                isProduction: true,
                title: "Headline over time comparison",
                category: "visualizationObject",
                contributor: "/gdc/account/profile/26728eacad349ba6c4c04c5e5cc59437",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/table",
                },
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier: "m1",
                                    title: "# Accounts with AD Query",
                                    alias: "AD Queries",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/8172",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1_pop",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m1",
                                            popAttribute: {
                                                uri: "/gdc/md/myproject/obj/1514",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1_previous_period",
                                    definition: {
                                        previousPeriodMeasure: {
                                            measureIdentifier: "m1",
                                            dateDataSets: [
                                                {
                                                    dataSet: {
                                                        uri: "/gdc/md/myproject/obj/921",
                                                    },
                                                    periodsAgo: 1,
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "attribute",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "a1",
                                    displayForm: {
                                        uri: "/gdc/md/myproject/obj/1515",
                                    },
                                },
                            },
                        ],
                    },
                ],
                properties: JSON.stringify({
                    sortItems: [
                        {
                            attributeSortItem: {
                                direction: "asc",
                                attributeIdentifier: "a1",
                            },
                        },
                    ],
                }),
            },
            meta: {
                author: "/gdc/account/profile/johndoe",
                uri: "/gdc/md/myproject/obj/2",
                tags: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aa5CD0OcfSpg",
                deprecated: false,
                summary: "",
                isProduction: true,
                title: "Over time comparison alias",
                category: "visualizationObject",
                contributor: "/gdc/account/profile/johndoe",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/table",
                },
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier:
                                        "arithmetic_measure_created_from_complicated_arithmetic_measures",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: [
                                                "arithmetic_measure_created_from_arithmetic_measures",
                                                "arithmetic_measure_created_from_simple_measures",
                                            ],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1",
                                    title: "# Accounts with AD Query",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/8172",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m2",
                                    title: "# Accounts with KD Query",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/1245",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m3",
                                    title: "# Accounts with AD Query",
                                    alias: "AD Queries",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/8172",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m4",
                                    title: "# Accounts with KD Query",
                                    alias: "KD Queries",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/1245",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1_pop",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m1",
                                            popAttribute: {
                                                uri: "/gdc/md/myproject/obj/1514",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1_previous_period",
                                    definition: {
                                        previousPeriodMeasure: {
                                            measureIdentifier: "m1",
                                            dateDataSets: [
                                                {
                                                    dataSet: {
                                                        uri: "/gdc/md/myproject/obj/921",
                                                    },
                                                    periodsAgo: 1,
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1_pop_renamed",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m1",
                                            popAttribute: {
                                                uri: "/gdc/md/myproject/obj/1514",
                                            },
                                        },
                                    },
                                    alias: "Renamed SP last year M1",
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1_previous_period_renamed",
                                    definition: {
                                        previousPeriodMeasure: {
                                            measureIdentifier: "m1",
                                            dateDataSets: [
                                                {
                                                    dataSet: {
                                                        uri: "/gdc/md/myproject/obj/921",
                                                    },
                                                    periodsAgo: 1,
                                                },
                                            ],
                                        },
                                    },
                                    alias: "Renamed previous period M1",
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "derived_measure_from_arithmetic_measure",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier:
                                                "arithmetic_measure_created_from_simple_measures",
                                            popAttribute: {
                                                uri: "/gdc/md/myproject/obj/1514",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "arithmetic_measure_created_from_simple_measures",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: ["m1", "m2"],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier:
                                        "arithmetic_measure_created_from_renamed_simple_measures",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: ["m3", "m4"],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "arithmetic_measure_created_from_derived_measures",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: ["m1_pop", "m1_previous_period"],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "arithmetic_measure_created_from_arithmetic_measures",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: [
                                                "arithmetic_measure_created_from_renamed_simple_measures",
                                                "arithmetic_measure_created_from_renamed_derived_measures",
                                            ],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier:
                                        "arithmetic_measure_created_from_renamed_derived_measures",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: [
                                                "m1_pop_renamed",
                                                "m1_previous_period_renamed",
                                            ],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "invalid_arithmetic_measure_with_missing_dependency",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: ["m1", "m666"],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "invalid_arithmetic_measure_with_cyclic_dependency_1",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: [
                                                "m1",
                                                "invalid_arithmetic_measure_with_cyclic_dependency_2",
                                            ],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "invalid_arithmetic_measure_with_cyclic_dependency_2",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: [
                                                "m2",
                                                "invalid_arithmetic_measure_with_cyclic_dependency_1",
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "attribute",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "a1",
                                    displayForm: {
                                        uri: "/gdc/md/myproject/obj/1515",
                                    },
                                },
                            },
                        ],
                    },
                ],
                properties: JSON.stringify({
                    sortItems: [
                        {
                            attributeSortItem: {
                                direction: "asc",
                                attributeIdentifier: "a1",
                            },
                        },
                    ],
                }),
            },
            meta: {
                author: "/gdc/account/profile/johndoe",
                uri: "/gdc/md/myproject/obj/2",
                tags: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aa5CD0OcfSpg",
                deprecated: false,
                summary: "",
                isProduction: true,
                title: "Arithmetic measures",
                category: "visualizationObject",
                contributor: "/gdc/account/profile/johndoe",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/table",
                },
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier:
                                        "arithmetic_measure_created_from_complicated_arithmetic_measures",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: [
                                                "arithmetic_measure_created_from_arithmetic_measures",
                                                "arithmetic_measure_created_from_simple_measures",
                                            ],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1",
                                    title: "AD Accounts",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/8172",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m2",
                                    title: "KD Accounts",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/1245",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "tree_level_2",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: ["m1", "tree_level_1"],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "tree_level_1",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: ["m1", "tree_level_0"],
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "tree_level_0",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: ["m1", "m2"],
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "attribute",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "a1",
                                    displayForm: {
                                        uri: "/gdc/md/myproject/obj/1515",
                                    },
                                },
                            },
                        ],
                    },
                ],
                properties: JSON.stringify({
                    sortItems: [
                        {
                            attributeSortItem: {
                                direction: "asc",
                                attributeIdentifier: "a1",
                            },
                        },
                    ],
                }),
            },
            meta: {
                author: "/gdc/account/profile/johndoe",
                uri: "/gdc/md/myproject/obj/2",
                tags: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aa5CD0OcfSpg",
                deprecated: false,
                summary: "",
                isProduction: true,
                title: "Arithmetic measures tree",
                category: "visualizationObject",
                contributor: "/gdc/account/profile/johndoe",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier: "b5a12d1bf094469d9b4e7d5d2bb87287",
                                    title: "Avg. Amount",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/jm8bsdakbhujk1a254h25a6mtd6orn9g/obj/62827",
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "view",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "02b7736f6bef48b1849798e430d837df",
                                    displayForm: {
                                        uri: "/gdc/md/jm8bsdakbhujk1a254h25a6mtd6orn9g/obj/324",
                                    },
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "segment",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "bc5257e06a9342ec99854bd1a53f3262",
                                    displayForm: {
                                        uri: "/gdc/md/jm8bsdakbhujk1a254h25a6mtd6orn9g/obj/952",
                                    },
                                },
                            },
                        ],
                    },
                ],
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/treemap",
                },
            },
            meta: {
                author: "/gdc/account/profile/9a4a028462b504f7ebe71d3c6a6e5786",
                uri: "/gdc/md/myproject/obj/3",
                tags: "",
                created: new Date("2018-05-23T09:24:41Z"),
                identifier: "aacp5FkYehh3",
                summary: "",
                title: "ONE-3417",
                category: "visualizationObject",
                contributor: "/gdc/account/profile/9a4a028462b504f7ebe71d3c6a6e5786",
            },
        },
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: "/gdc/md/myproject/obj/table",
                },
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                measure: {
                                    localIdentifier: "am1",
                                    definition: {
                                        arithmeticMeasure: {
                                            operator: "sum",
                                            measureIdentifiers: ["m1", "m1_pop"],
                                        },
                                    },
                                    title: "ignored title",
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1",
                                    title: "AD Accounts",
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: "/gdc/md/myproject/obj/8172",
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                measure: {
                                    localIdentifier: "m1_pop",
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: "m1",
                                            popAttribute: {
                                                uri: "/gdc/md/myproject/obj/1514",
                                            },
                                        },
                                    },
                                    title: "ignored title",
                                },
                            },
                        ],
                    },
                    {
                        localIdentifier: "attribute",
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: "a1",
                                    displayForm: {
                                        uri: "/gdc/md/myproject/obj/1515",
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            meta: {
                author: "/gdc/account/profile/johndoe",
                uri: "/gdc/md/myproject/obj/2",
                tags: "",
                created: new Date("2015-05-23T09:24:41Z"),
                identifier: "aa5CD0OcfSpg",
                deprecated: false,
                summary: "",
                isProduction: true,
                title: "Arithmetic and derived measures",
                category: "visualizationObject",
                contributor: "/gdc/account/profile/johndoe",
            },
        },
    },
];

export const visualizationClasses: IVisualizationClassWrapped[] = [
    {
        visualizationClass: {
            content: {
                url: "local:column",
                icon: "",
                iconSelected: "",
                checksum: "",
            },
            meta: {
                title: "Column chart",
                uri: "/gdc/md/myproject/obj/column",
            },
        },
    },
    {
        visualizationClass: {
            content: {
                url: "local:table",
                icon: "",
                iconSelected: "",
                checksum: "",
            },
            meta: {
                title: "Table chart",
                uri: "/gdc/md/myproject/obj/table",
            },
        },
    },
    {
        visualizationClass: {
            content: {
                url: "local:treemap",
                icon: "",
                iconSelected: "",
                checksum: "",
            },
            meta: {
                title: "Treemap",
                uri: "/gdc/md/myproject/obj/treemap",
            },
        },
    },
];

export const comboVizObjectContent: VisualizationObject.IVisualizationObjectContent = {
    visualizationClass: {
        uri: "/gdc/md/myproject/obj/column",
    },
    buckets: [
        {
            localIdentifier: "measures",
            items: measures.slice(0),
        },
        {
            localIdentifier: "secondary_measures",
            items: measures.slice(1),
        },
        {
            localIdentifier: "view",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "a1",
                        displayForm: {
                            uri: "/gdc/md/myproject/obj/851",
                        },
                    },
                },
            ],
        },
    ],
};
