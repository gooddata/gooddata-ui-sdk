// (C) 2022 GoodData Corporation
import { ExecutionResult } from "@gooddata/api-client-tiger";
import { dimensionLocalIdentifier } from "../../../toBackend/afm/DimensionsConverter.js";
import {
    defWithDimensions,
    IDimensionDescriptor,
    idRef,
    MeasureGroupIdentifier,
    newDefForItems,
    newDimension,
    newMeasure,
    newTotal,
} from "@gooddata/sdk-model";

export const mockDefinition1 = defWithDimensions(
    newDefForItems("test", [newMeasure("1"), newMeasure("2")]),
    newDimension(
        ["localAttr1"],
        [
            newTotal("sum", "m_1", "localAttr1"),
            newTotal("sum", "m_2", "localAttr1"),
            newTotal("max", "m_2", "localAttr1"),
        ],
    ),
    newDimension(["localAttr2", MeasureGroupIdentifier]),
);

export const mockResult1: ExecutionResult = {
    data: [
        [1, 1, 4, 2],
        [2, 1, 5, 2],
        [3, 1, 6, 2],
    ],
    dimensionHeaders: [
        {
            headerGroups: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                labelValue: "A",
                                primaryLabelValue: "A",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "B",
                                primaryLabelValue: "B",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "C",
                                primaryLabelValue: "C",
                            },
                        },
                    ],
                },
            ],
        },
        {
            headerGroups: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                labelValue: "Alpha",
                                primaryLabelValue: "Alpha",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Alpha",
                                primaryLabelValue: "Alpha",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Beta",
                                primaryLabelValue: "Beta",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Beta",
                                primaryLabelValue: "Beta",
                            },
                        },
                    ],
                },
                {
                    headers: [
                        {
                            measureHeader: {
                                measureIndex: 0,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 1,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 0,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 1,
                            },
                        },
                    ],
                },
            ],
        },
    ],
    grandTotals: [
        {
            data: [
                [6, 3, 15, 6],
                [null, 1, null, 2],
            ],
            dimensionHeaders: [
                {
                    headerGroups: [
                        {
                            headers: [
                                {
                                    totalHeader: {
                                        function: "SUM",
                                    },
                                },
                                {
                                    totalHeader: {
                                        function: "MAX",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            totalDimensions: [dimensionLocalIdentifier(1)],
        },
    ],
    paging: {
        count: [1, 2],
        offset: [0, 0],
        total: [1, 2],
    },
};

export const mockDimensions1: IDimensionDescriptor[] = [
    {
        headers: [
            {
                attributeHeader: {
                    identifier: "greek",
                    localIdentifier: "localAttr2",
                    name: "Greek letters",
                    uri: "fiz",
                    ref: idRef("greek"),
                    formOf: {
                        identifier: "greek",
                        uri: "baz",
                        name: "Greek letters",
                        ref: idRef("greek"),
                    },
                },
            },
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                localIdentifier: "m_1",
                                name: "Metric 1",
                                format: "#,##0",
                            },
                        },
                        {
                            measureHeaderItem: {
                                localIdentifier: "m_2",
                                name: "Metric 2",
                                format: "#,##0",
                            },
                        },
                    ],
                },
            },
        ],
    },
    {
        headers: [
            {
                attributeHeader: {
                    identifier: "latin",
                    localIdentifier: "localAttr1",
                    name: "Latin letters",
                    uri: "foo",
                    ref: idRef("latin"),
                    formOf: {
                        identifier: "latin",
                        uri: "bar",
                        name: "Latin letters",
                        ref: idRef("latin"),
                    },
                },
            },
        ],
    },
];

export const mockDefinition2 = defWithDimensions(
    newDefForItems("test", [newMeasure("1"), newMeasure("2"), newMeasure("3"), newMeasure("4")]),
    newDimension(
        ["localAttr1", "localAttr2"],
        [newTotal("sum", "m_1", "localAttr1"), newTotal("sum", "m_2", "localAttr1")],
    ),
    newDimension([MeasureGroupIdentifier]),
);

export const mockResult2 = {
    data: [
        [449, 41.320524781341106, 0.17725916115332446, 16744.48],
        [172, 46.30830065359477, 0.07819070840973427, 7386.15],
        [727, 26.586969178082192, 0.18452791227743862, 17431.11],
        [854, 21.873084648493546, 0.17461697017263958, 16494.89],
        [557, 36.620566448801746, 0.19551673364684496, 18469.15],
        [1096, 18.500912052117265, 0.1898885143400181, 17937.49],
        [149, 115.06585365853658, 0.15973175146727148, 14421.37],
        [253, 57.807943925233644, 0.14394284849088326, 12995.87],
        [571, 86.17856223175966, 0.48763974231358437, 44026.52],
        [735, 28.59485996705107, 0.20868565772826095, 18841.17],
        [144, 37.45467213114754, 0.06838997246733888, 4725.73],
        [258, 76.52254545454545, 0.25553420960278433, 17657.35],
        [386, 114.36082822085889, 0.5833271466249879, 40307.76],
        [542, 12.718106382978723, 0.09274867130488894, 6408.91],
        [147, 260.141512605042, 0.16556859291478074, 34697.71],
        [58, 553.8807547169812, 0.13199641470235435, 27662.09],
        [63, 811.6090566037736, 0.22793065968694112, 47766.74],
        [71, 1568.7147457627118, 0.47450433269592374, 99440.44],
    ],
    dimensionHeaders: [
        {
            headerGroups: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                labelValue: "Clothing",
                                primaryLabelValue: "Clothing",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Clothing",
                                primaryLabelValue: "Clothing",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Clothing",
                                primaryLabelValue: "Clothing",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Clothing",
                                primaryLabelValue: "Clothing",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Clothing",
                                primaryLabelValue: "Clothing",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Clothing",
                                primaryLabelValue: "Clothing",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Electronics",
                                primaryLabelValue: "Electronics",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Electronics",
                                primaryLabelValue: "Electronics",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Electronics",
                                primaryLabelValue: "Electronics",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Electronics",
                                primaryLabelValue: "Electronics",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Home",
                                primaryLabelValue: "Home",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Home",
                                primaryLabelValue: "Home",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Home",
                                primaryLabelValue: "Home",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Home",
                                primaryLabelValue: "Home",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Outdoor",
                                primaryLabelValue: "Outdoor",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Outdoor",
                                primaryLabelValue: "Outdoor",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Outdoor",
                                primaryLabelValue: "Outdoor",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Outdoor",
                                primaryLabelValue: "Outdoor",
                            },
                        },
                    ],
                },
                {
                    headers: [
                        {
                            attributeHeader: {
                                labelValue: "Polo Shirt",
                                primaryLabelValue: "Polo Shirt",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Pullover",
                                primaryLabelValue: "Pullover",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Shorts",
                                primaryLabelValue: "Shorts",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Skirt",
                                primaryLabelValue: "Skirt",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Slacks",
                                primaryLabelValue: "Slacks",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "T-Shirt",
                                primaryLabelValue: "T-Shirt",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Artego",
                                primaryLabelValue: "Artego",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Compglass",
                                primaryLabelValue: "Compglass",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Magnemo",
                                primaryLabelValue: "Magnemo",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "PortaCode",
                                primaryLabelValue: "PortaCode",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Applica",
                                primaryLabelValue: "Applica",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "ChalkTalk",
                                primaryLabelValue: "ChalkTalk",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Optique",
                                primaryLabelValue: "Optique",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Peril",
                                primaryLabelValue: "Peril",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Biolid",
                                primaryLabelValue: "Biolid",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Elentrix",
                                primaryLabelValue: "Elentrix",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Integres",
                                primaryLabelValue: "Integres",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Neptide",
                                primaryLabelValue: "Neptide",
                            },
                        },
                    ],
                },
            ],
        },
        {
            headerGroups: [
                {
                    headers: [
                        {
                            measureHeader: {
                                measureIndex: 0,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 1,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 2,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 3,
                            },
                        },
                    ],
                },
            ],
        },
    ],
    grandTotals: [
        {
            data: [[7232, 3914.259799423051, null, null]],
            dimensionHeaders: [
                {
                    headerGroups: [
                        {
                            headers: [
                                {
                                    totalHeader: {
                                        function: "SUM",
                                    },
                                },
                            ],
                        },
                        {
                            headers: [
                                {
                                    totalHeader: {
                                        function: "SUM",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            totalDimensions: ["dim_1"],
        },
    ],
    paging: {
        count: [18, 4],
        offset: [0, 0],
        total: [18, 4],
    },
};

export const mockDimensions2: IDimensionDescriptor[] = [
    {
        headers: [
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                localIdentifier: "m_1",
                                name: "Metric 1",
                                format: "#,##0",
                            },
                        },
                        {
                            measureHeaderItem: {
                                localIdentifier: "m_2",
                                name: "Metric 2",
                                format: "#,##0",
                            },
                        },
                        {
                            measureHeaderItem: {
                                localIdentifier: "m_3",
                                name: "Metric 1",
                                format: "#,##0",
                            },
                        },
                        {
                            measureHeaderItem: {
                                localIdentifier: "m_4",
                                name: "Metric 2",
                                format: "#,##0",
                            },
                        },
                    ],
                },
            },
        ],
    },
    {
        headers: [
            {
                attributeHeader: {
                    identifier: "product.category",
                    localIdentifier: "localAttr1",
                    name: "Product category",
                    uri: "fiz",
                    ref: idRef("product.category"),
                    formOf: {
                        identifier: "product.category",
                        uri: "baz",
                        name: "Product category",
                        ref: idRef("product.category"),
                    },
                },
            },
            {
                attributeHeader: {
                    identifier: "product.name",
                    localIdentifier: "localAttr2",
                    name: "Product name",
                    uri: "foo",
                    ref: idRef("product.category"),
                    formOf: {
                        identifier: "product.category",
                        uri: "bar",
                        name: "Product name",
                        ref: idRef("product.category"),
                    },
                },
            },
        ],
    },
];

export const mockDefinition3 = defWithDimensions(
    newDefForItems("test", [newMeasure("1"), newMeasure("2")]),
    newDimension(
        ["localAttr1"],
        [newTotal("sum", "m_1", "localAttr1"), newTotal("sum", "m_2", "localAttr1")],
    ),
    newDimension(["localAttr2", MeasureGroupIdentifier], [newTotal("sum", "m_1", "localAttr2")]),
);

export const mockResult3 = {
    data: [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
    ],
    dimensionHeaders: [
        {
            headerGroups: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                labelValue: "Clothing",
                                primaryLabelValue: "Clothing",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Electronics",
                                primaryLabelValue: "Electronics",
                            },
                        },
                    ],
                },
            ],
        },
        {
            headerGroups: [
                {
                    headers: [
                        {
                            attributeHeader: {
                                labelValue: "Polo Shirt",
                                primaryLabelValue: "Polo Shirt",
                            },
                        },
                        {
                            attributeHeader: {
                                labelValue: "Pullover",
                                primaryLabelValue: "Pullover",
                            },
                        },
                    ],
                },
                {
                    headers: [
                        {
                            measureHeader: {
                                measureIndex: 0,
                            },
                        },
                        {
                            measureHeader: {
                                measureIndex: 1,
                            },
                        },
                    ],
                },
            ],
        },
    ],
    grandTotals: [
        {
            data: [[4], [12]],
            dimensionHeaders: [
                {
                    headerGroups: [
                        {
                            headers: [
                                {
                                    totalHeader: {
                                        function: "SUM",
                                    },
                                },
                            ],
                        },
                        {
                            headers: [
                                {
                                    measureHeader: {
                                        measureIndex: 0,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            totalDimensions: ["dim_0"],
        },
        {
            data: [[6, null, 10, null]],
            dimensionHeaders: [
                {
                    headerGroups: [
                        {
                            headers: [
                                {
                                    totalHeader: {
                                        function: "SUM",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            totalDimensions: ["dim_1"],
        },
        {
            data: [[16]],
            dimensionHeaders: [
                {
                    headerGroups: [
                        {
                            headers: [
                                {
                                    totalHeader: {
                                        function: "SUM",
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    headerGroups: [
                        {
                            headers: [
                                {
                                    totalHeader: {
                                        function: "SUM",
                                    },
                                },
                            ],
                        },
                        {
                            headers: [
                                {
                                    measureHeader: {
                                        measureIndex: 0,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            totalDimensions: [],
        },
    ],
    paging: {
        count: [2, 4],
        offset: [0, 0],
        total: [2, 4],
    },
};

export const mockDimensions3: IDimensionDescriptor[] = [
    {
        headers: [
            {
                attributeHeader: {
                    identifier: "product.name",
                    localIdentifier: "localAttr2",
                    name: "Product name",
                    uri: "foo",
                    ref: idRef("product.category"),
                    formOf: {
                        identifier: "product.category",
                        uri: "bar",
                        name: "Product name",
                        ref: idRef("product.category"),
                    },
                },
            },
            {
                measureGroupHeader: {
                    items: [
                        {
                            measureHeaderItem: {
                                localIdentifier: "m_1",
                                name: "Metric 1",
                                format: "#,##0",
                            },
                        },
                        {
                            measureHeaderItem: {
                                localIdentifier: "m_2",
                                name: "Metric 2",
                                format: "#,##0",
                            },
                        },
                    ],
                },
            },
        ],
    },
    {
        headers: [
            {
                attributeHeader: {
                    identifier: "product.category",
                    localIdentifier: "localAttr1",
                    name: "Product category",
                    uri: "fiz",
                    ref: idRef("product.category"),
                    formOf: {
                        identifier: "product.category",
                        uri: "baz",
                        name: "Product category",
                        ref: idRef("product.category"),
                    },
                },
            },
        ],
    },
];
