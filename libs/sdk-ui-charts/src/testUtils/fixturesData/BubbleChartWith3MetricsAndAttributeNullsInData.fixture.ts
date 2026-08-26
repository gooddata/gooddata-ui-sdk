// (C) 2026 GoodData Corporation

export const BubbleChartWith3MetricsAndAttributeNullsInData = {
    definition: {
        workspace: "testWorkspace",
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "784a5018a51049078e8f7e86247e08a3",
                            title: "_Snapshot [EOP-2]",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "obj_67097",
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
                            localIdentifier: "9e5c3cd9a93f4476a93d3494cedc6010",
                            title: "# of Open Opps.",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "obj_13465",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "tertiary_measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "71d50cf1d13746099b7f506576d78e4a",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "obj_1543",
                                    },
                                },
                            },
                            title: "Remaining Quota",
                        },
                    },
                ],
            },
            {
                localIdentifier: "attribute",
                items: [
                    {
                        attribute: {
                            displayForm: {
                                uri: "obj_1028",
                            },
                            localIdentifier: "49a659fbd7c541a69284769d53a2be7f",
                        },
                    },
                ],
            },
        ],
        attributes: [
            {
                attribute: {
                    displayForm: {
                        uri: "obj_1028",
                    },
                    localIdentifier: "49a659fbd7c541a69284769d53a2be7f",
                },
            },
        ],
        measures: [
            {
                measure: {
                    localIdentifier: "784a5018a51049078e8f7e86247e08a3",
                    alias: "_Snapshot [EOP-2]",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_67097",
                            },
                            filters: [],
                        },
                    },
                },
            },
            {
                measure: {
                    localIdentifier: "9e5c3cd9a93f4476a93d3494cedc6010",
                    alias: "# of Open Opps.",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_13465",
                            },
                            filters: [],
                        },
                    },
                },
            },
            {
                measure: {
                    localIdentifier: "71d50cf1d13746099b7f506576d78e4a",
                    alias: "Remaining Quota",
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: "obj_1543",
                            },
                            filters: [],
                        },
                    },
                },
            },
        ],
        dimensions: [
            {
                itemIdentifiers: ["49a659fbd7c541a69284769d53a2be7f"],
            },
            {
                itemIdentifiers: ["measureGroup"],
            },
        ],
        filters: [],
        sortBy: [],
    },
    response: {
        executionResponse: {
            dimensions: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                name: "Owner Name",
                                localIdentifier: "49a659fbd7c541a69284769d53a2be7f",
                                uri: "obj_1028",
                                identifier: "label.owner.id.name",
                                formOf: {
                                    name: "Sales Rep",
                                    uri: "obj_1025",
                                    identifier: "attr.owner.id",
                                },
                            },
                        },
                    ],
                },
                {
                    headers: [
                        {
                            measureGroupHeader: {
                                items: [
                                    {
                                        measureHeaderItem: {
                                            name: "_Snapshot [EOP-2]",
                                            format: "#,##0.00",
                                            localIdentifier: "784a5018a51049078e8f7e86247e08a3",
                                            uri: "obj_67097",
                                            identifier: "ab0bydLaaisS",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "# of Open Opps.",
                                            format: "#,##0",
                                            localIdentifier: "9e5c3cd9a93f4476a93d3494cedc6010",
                                            uri: "obj_13465",
                                            identifier: "aaYh6Voua2yj",
                                        },
                                    },
                                    {
                                        measureHeaderItem: {
                                            name: "Remaining Quota",
                                            format: "$#,#00.00",
                                            localIdentifier: "71d50cf1d13746099b7f506576d78e4a",
                                            uri: "obj_1543",
                                            identifier: "ab4EFOAmhjOx",
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
            links: {
                executionResult:
                    "/gdc/app/projects/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/executionResults/8462543598567816192?q=eAGlUttOAjEQ%2FZVN18fVLZfllhif0PAiCvJENqa7O0BNb7bdIJD9d2dBjZJogiRN05nJnDNzTnfE%0AgtHW3zMJZEBmynMvoCARybUopXJkMCcSvOX5ndWlIWn0EdaVHVloK5nHzjAKQ3pFKXa6UkpmN5jE%0AYI%2BHz%2BepYsattA%2Fmw%2FHDZTPF2gF3VGA5XhZ5LIt4td2IZC1WPatKyt9kthXs1WwXtO991s17sc5e%0A4k6X9rukio7pf%2BMOA70IxgYUXsZdncHcaLU7yU%2FmC9yc%2FrX5BCTjiqtl8Fhqz85hT9otUqEDVq8P%0A8jOPzmSlh6faNtRxygS4YALmWIuCOyPY5hb9Ol3wBm32EDBjDoYCJCg%2Fm4xOdQ1BkhgO7e6GF9eI%0A%2BPk7vo%2F9tdO%2F5kxqVJRZ1ALN02h%2F0iqt3gFBsvZA%0A&c=b106b3ac0d5dfad3f599a50e077a91a9&offset=0%2C0&limit=1000%2C1000&dimensions=2&totals=0%2C0",
            },
        },
    },
    result: {
        executionResult: {
            data: [
                [null, "33", "2424413.8"],
                ["414", null, "1963436.86"],
                [null, null, "2100205.16"],
                ["414", "30", null],
                ["546", "30", "1776567.88"],
                ["12", "35", "2615259.07"],
                ["199", "29", "1471667.02"],
                ["475", "31", "2161030.33"],
                ["245", "32", "2280481.04"],
                ["347", "26", "1769560.54"],
                ["345", "42", "2346482.16"],
                ["34", "30", "1705084.84"],
                ["323", "30", "2345090.98"],
                ["346", "64", "131675.42"],
                ["457", "88", "1668600.86"],
                ["451", "93", "1649882.14"],
                ["232", "70", "1229206.9"],
                ["311", "71", "457045.18"],
                ["700", "60", "801178.61"],
                ["246", "60", "1065164.57"],
            ],
            paging: {
                count: [20, 3],
                offset: [0, 0],
                total: [20, 3],
            },
            headerItems: [
                [
                    [
                        {
                            attributeHeaderItem: {
                                name: "Adam Bradley",
                                uri: "elem_1025_1224",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Alejandro Vabiano",
                                uri: "elem_1025_1227",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Alexsandr Fyodr",
                                uri: "elem_1025_1228",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Cory Owens",
                                uri: "elem_1025_1229",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Dale Perdadtin",
                                uri: "elem_1025_1230",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Dave Bostadt",
                                uri: "elem_1025_1231",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Ellen Jones",
                                uri: "elem_1025_1232",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Huey Jonas",
                                uri: "elem_1025_1233",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Jessica Traven",
                                uri: "elem_1025_1235",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "John Jovi",
                                uri: "elem_1025_1236",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Jon Jons",
                                uri: "elem_1025_1238",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Lea Forbes",
                                uri: "elem_1025_1239",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Monique Babonas",
                                uri: "elem_1025_1240",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Paul Gomez",
                                uri: "elem_1025_1241",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Paul Jacobs",
                                uri: "elem_1025_1242",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Ravi Deetri",
                                uri: "elem_1025_1243",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Thomas Gones",
                                uri: "elem_1025_1244",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Tom Stickler",
                                uri: "elem_1025_1245",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Trevor Deegan",
                                uri: "elem_1025_1246",
                            },
                        },
                        {
                            attributeHeaderItem: {
                                name: "Victor Crushetz",
                                uri: "elem_1025_1247",
                            },
                        },
                    ],
                ],
                [
                    [
                        {
                            measureHeaderItem: {
                                name: "_Snapshot [EOP-2]",
                                order: 0,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "# of Open Opps.",
                                order: 1,
                            },
                        },
                        {
                            measureHeaderItem: {
                                name: "Remaining Quota",
                                order: 2,
                            },
                        },
                    ],
                ],
            ],
        },
    },
};
