// (C) 2007-2019 GoodData Corporation
import { Execution, VisualizationObject } from "@gooddata/typings";
import { getStackByAttribute } from "../stackByAttribute";
import { IUnwrappedAttributeHeadersWithItems } from "../../components/visualizations/chart/chartOptionsBuilder";
import { IChartConfig } from "../../interfaces/Config";
import { VisualizationTypes } from "../../constants/visualizationTypes";

const dimensions: Execution.IResultDimension[] = [
    {
        headers: [
            {
                attributeHeader: {
                    name: "Region",
                    localIdentifier: "02eed1089e6149d9b448637cf32b2c43",
                    uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1024",
                    identifier: "label.owner.region",
                    formOf: {
                        name: "Region",
                        uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1023",
                        identifier: "attr.owner.region",
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
                                name: "Amount",
                                format: "$#,##0.00",
                                localIdentifier: "82d26962672c436bb183a02a78551918",
                                uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1279",
                                identifier: "ah1EuQxwaCqs",
                            },
                        },
                    ],
                },
            },
        ],
    },
];
const attributeHeaderItems: Execution.IResultHeaderItem[][][] = [
    [
        [
            {
                attributeHeaderItem: {
                    name: "East Coast",
                    uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1023/elements?id=1225",
                },
            },
            {
                attributeHeaderItem: {
                    name: "West Coast",
                    uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1023/elements?id=1237",
                },
            },
        ],
    ],
    [],
];

const mdObject: VisualizationObject.IVisualizationObjectContent = {
    buckets: [
        {
            localIdentifier: "measures",
            items: [
                {
                    measure: {
                        localIdentifier: "82d26962672c436bb183a02a78551918",
                        definition: {
                            measureDefinition: {
                                item: { uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1279" },
                            },
                        },
                        title: "Amount",
                    },
                },
            ],
        },
        {
            localIdentifier: "stack",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "02eed1089e6149d9b448637cf32b2c43",
                        displayForm: { uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1024" },
                    },
                },
            ],
        },
    ],
    filters: [
        {
            positiveAttributeFilter: {
                displayForm: { uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/952" },
                in: [
                    "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/949/elements?id=168279",
                    "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/949/elements?id=168282",
                ],
            },
        },
        {
            negativeAttributeFilter: {
                displayForm: { uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1024" },
                notIn: [],
            },
        },
    ],
    visualizationClass: { uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/75536" },
};

describe("getStackByAttribute", () => {
    const expectedStackByAttribute = {
        name: "Region",
        localIdentifier: "02eed1089e6149d9b448637cf32b2c43",
        uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1024",
        identifier: "label.owner.region",
        formOf: {
            name: "Region",
            uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1023",
            identifier: "attr.owner.region",
        },
        items: [
            {
                attributeHeaderItem: {
                    name: "East Coast",
                    uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1023/elements?id=1225",
                },
            },
            {
                attributeHeaderItem: {
                    name: "West Coast",
                    uri: "/gdc/md/dfnkvzqa683mz1c29ijdkydrsodm8wjw/obj/1023/elements?id=1237",
                },
            },
        ],
    };
    it("should return stackBy attribute for treemap chart", () => {
        const testDimensions = [dimensions[1], dimensions[0]];
        const testAttributeHeaderItems = [attributeHeaderItems[1], attributeHeaderItems[0]];
        const testMdObject = { ...mdObject };
        testMdObject.buckets[1].localIdentifier = "segment";

        const config: IChartConfig = {
            mdObject: testMdObject,
            stackMeasuresToPercent: true,
            type: VisualizationTypes.TREEMAP,
        };

        const stackByAttribute: IUnwrappedAttributeHeadersWithItems = getStackByAttribute(
            config,
            testDimensions,
            testAttributeHeaderItems,
        );

        expect(stackByAttribute).toEqual(expectedStackByAttribute);
    });

    it("should return stackBy attribute for other chart type", () => {
        const testDimensions = [dimensions[0], dimensions[1]];
        const testAttributeHeaderItems = [attributeHeaderItems[0], attributeHeaderItems[1]];
        const testMdObject = { ...mdObject };
        testMdObject.buckets[1].localIdentifier = "stack";

        const config: IChartConfig = {
            mdObject: testMdObject,
            stackMeasuresToPercent: true,
            type: VisualizationTypes.AREA,
        };

        const stackByAttribute: IUnwrappedAttributeHeadersWithItems = getStackByAttribute(
            config,
            testDimensions,
            testAttributeHeaderItems,
        );

        expect(stackByAttribute).toEqual(expectedStackByAttribute);
    });
});
