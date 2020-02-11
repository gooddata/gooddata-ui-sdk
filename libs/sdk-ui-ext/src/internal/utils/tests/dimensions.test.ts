// (C) 2007-2020 GoodData Corporation
import cloneDeep = require("lodash/cloneDeep");
import { VisualizationTypes } from "../../../base/vis/visualizationTypes";
import {
    generateDimensions,
    generateStackedDimensions,
    getHeadlinesDimensions,
    getPivotTableDimensions,
} from "../dimensions";
import {
    insightWithProperties,
    singleAttributeInsight,
    singleMeasureInsight,
} from "../../../../__mocks__/fixtures";
import { BucketNames } from "../../../base";
import {
    bucketsFind,
    IBucket,
    IDimension,
    IInsight,
    insightBucket,
    insightBuckets,
    ITotal,
    newBucket,
} from "@gooddata/sdk-model";

/*
 * WARNING: tests in this file rely on mutating insight and mutating buckets. We should revisit all the tests here.
 * Ideally, all these _component_ tests (they test the dimension generator) should use recorded insights; no mutations
 * here. Even further, all these tests should be replaced by a single massive parameterized test taking many
 * different recorded insights and verifying dimensionality.
 */

function getVisualizationBucket(newVis: IInsight, bucketName: string): IBucket {
    const buckets = insightBuckets(newVis);
    let bucket = bucketsFind(buckets, bucketName);

    if (!bucket) {
        bucket = newBucket(bucketName);
        buckets.push(bucket);
    }

    return bucket;
}

function addMeasure(visualization: IInsight, index: number): IInsight {
    const newVis = cloneDeep(visualization);
    const measure = {
        measure: {
            localIdentifier: `m${index}`,
            title: `# Users Opened AD ${index}`,
            definition: {
                measureDefinition: {
                    item: {
                        uri: `/gdc/md/myproject/obj/150${index}`,
                    },
                },
            },
        },
    };

    const bucket = insightBucket(newVis);
    bucket.items.push(measure);

    return newVis;
}

function addAttribute(visualization: IInsight, index: number, bucketName: string): IInsight {
    const newVis = cloneDeep(visualization);
    const attribute = {
        attribute: {
            localIdentifier: `a${index}`,
            displayForm: {
                uri: `/gdc/md/myproject/obj/400${index}`,
            },
        },
    };

    const bucket = getVisualizationBucket(newVis, bucketName);
    bucket.items.push(attribute);

    return newVis;
}

function addTotals(visualization: IInsight, bucketName: string, newTotals: ITotal[]): IInsight {
    const newVis = cloneDeep(visualization);

    const bucket = getVisualizationBucket(newVis, bucketName);

    if (!bucket.totals) {
        bucket.totals = [];
    }

    newTotals.forEach(total => {
        bucket.totals.push(total);
    });

    return newVis;
}

function newInsight(buckets: IBucket[]): IInsight {
    return {
        insight: {
            identifier: "test",
            uri: "test",
            title: "no name",
            visualizationUrl: "classId",
            buckets,
            filters: [],
            sorts: [],
            properties: {},
        },
    };
}

describe("getHeadlinesDimensions", () => {
    it("should always return just one dimension with a measureGroup", () => {
        const expectedDimensions: IDimension[] = [
            {
                itemIdentifiers: ["measureGroup"],
            },
        ];

        expect(getHeadlinesDimensions()).toEqual(expectedDimensions);
    });
});

describe("getPivotTableDimensions", () => {
    // tslint:disable-next-line:max-line-length
    it("should return row attributes in the first dimensions, column attributes and measureGroup in second dimension", () => {
        const expectedDimensions: IDimension[] = [
            {
                itemIdentifiers: ["a1"],
            },
            {
                itemIdentifiers: ["a2", "measureGroup"],
            },
        ];

        const buckets = [
            {
                localIdentifier: BucketNames.MEASURES,
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            title: "# Accounts with AD Query",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/myproject/obj/m1",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                // ATTRIBUTE for backwards compatibility with Table component. Actually ROWS
                localIdentifier: BucketNames.ATTRIBUTE,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                uri: "/gdc/md/myproject/obj/a1",
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: BucketNames.COLUMNS,
                items: [
                    {
                        attribute: {
                            localIdentifier: "a2",
                            displayForm: {
                                uri: "/gdc/md/myproject/obj/a2",
                            },
                        },
                    },
                ],
            },
        ];

        expect(getPivotTableDimensions(newInsight(buckets))).toEqual(expectedDimensions);
    });
});

describe("generateDimensions", () => {
    describe("column/bar chart", () => {
        it("should generate dimensions for one measure", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: [],
                },
            ];

            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.COLUMN)).toEqual(
                expectedDimensions,
            );
            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.BAR)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: ["a1"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.COLUMN)).toEqual(
                expectedDimensions,
            );
            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.BAR)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and stack attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a1"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithStackAttribute = addAttribute(visualization, 1, "stack");

            expect(generateDimensions(visualizationWithStackAttribute, VisualizationTypes.COLUMN)).toEqual(
                expectedDimensions,
            );
            expect(generateDimensions(visualizationWithStackAttribute, VisualizationTypes.BAR)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure, view attribute and stack attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a2"],
                },
                {
                    itemIdentifiers: ["a1", "measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, "view"),
                2,
                "stack",
            );

            expect(
                generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.COLUMN),
            ).toEqual(expectedDimensions);
            expect(
                generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.BAR),
            ).toEqual(expectedDimensions);
        });
    });
    describe("area chart", () => {
        it("should generate dimensions for area with one measure", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: [],
                },
            ];
            const dimensions = generateDimensions(singleMeasureInsight, VisualizationTypes.AREA);
            expect(dimensions).toEqual(expectedDimensions);
        });

        it("should generate dimensions for area with one measure and view attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: ["a1"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");
            const dimensions = generateDimensions(visualizationWithViewAttribute, VisualizationTypes.AREA);

            expect(dimensions).toEqual(expectedDimensions);
        });

        it("should generate dimensions for area with one measure and stack attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a1"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithStackAttribute = addAttribute(visualization, 1, "stack");
            const dimensions = generateDimensions(visualizationWithStackAttribute, VisualizationTypes.AREA);

            expect(dimensions).toEqual(expectedDimensions);
        });

        it("should generate dimensions for area with one measure, view attribute and stack attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a2"],
                },
                {
                    itemIdentifiers: ["a1", "measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, "view"),
                2,
                "stack",
            );
            const dimensions = generateDimensions(
                visualizationWithViewAndStackAttribute,
                VisualizationTypes.AREA,
            );

            expect(dimensions).toEqual(expectedDimensions);
        });

        it("should generate dimensions for area with one measure, two view attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a2"],
                },
                {
                    itemIdentifiers: ["a1", "measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithTwoViewAttributes = addAttribute(
                addAttribute(visualization, 1, "view"),
                2,
                "view",
            );
            const dimensions = generateDimensions(
                visualizationWithTwoViewAttributes,
                VisualizationTypes.AREA,
            );

            expect(dimensions).toEqual(expectedDimensions);
        });
    });
    describe("heatmap", () => {
        it("should generate dimensions for one measure", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: [],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.HEATMAP)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a1"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.HEATMAP)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and stack attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: [],
                },
                {
                    itemIdentifiers: ["a1", "measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithStackAttribute = addAttribute(visualization, 1, "stack");

            expect(generateDimensions(visualizationWithStackAttribute, VisualizationTypes.HEATMAP)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure, view attribute and stack attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a1"],
                },
                {
                    itemIdentifiers: ["a2", "measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, "view"),
                2,
                "stack",
            );

            expect(
                generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.HEATMAP),
            ).toEqual(expectedDimensions);
        });
    });
    describe("line chart", () => {
        it("should generate dimensions for one measure", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: [],
                },
            ];

            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.LINE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: ["a1"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "trend");

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.LINE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and stack attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a1"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "segment");

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.LINE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure, view attribute and stack attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a2"],
                },
                {
                    itemIdentifiers: ["a1", "measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, "trend"),
                2,
                "segment",
            );

            expect(
                generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.LINE),
            ).toEqual(expectedDimensions);
        });
    });
    describe("pie chart", () => {
        it("should generate dimensions for one measure", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: [],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.PIE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: ["a1"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.PIE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and 2 view attributes", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: ["a1", "a2"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWith2ViewAttributes = addAttribute(
                addAttribute(visualization, 1, "view"),
                2,
                "view",
            );

            expect(generateDimensions(visualizationWith2ViewAttributes, VisualizationTypes.PIE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for two measures", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: [],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWith2Measures = addMeasure(visualization, 2);

            expect(generateDimensions(visualizationWith2Measures, VisualizationTypes.PIE)).toEqual(
                expectedDimensions,
            );
        });
    });
    describe("treemap", () => {
        it("should generate dimensions for one measure", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: [],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.TREEMAP)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["measureGroup"],
                },
                {
                    itemIdentifiers: ["a1"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");

            expect(generateDimensions(visualizationWithViewAttribute, VisualizationTypes.TREEMAP)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for two measures", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: [],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWith2Measures = addMeasure(visualization, 2);

            expect(generateDimensions(visualizationWith2Measures, VisualizationTypes.TREEMAP)).toEqual(
                expectedDimensions,
            );
        });
    });
    describe("table", () => {
        it("should generate dimensions for one measure", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: [],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.TABLE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a1"],
                },
                {
                    itemIdentifiers: [],
                },
            ];

            expect(generateDimensions(singleAttributeInsight, VisualizationTypes.TABLE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and attribute", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a1"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWithAttribute = addAttribute(visualization, 1, "attribute");

            expect(generateDimensions(visualizationWithAttribute, VisualizationTypes.TABLE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for one measure and 2 attributes", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: ["a1", "a2"],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWith2Attributes = addAttribute(
                addAttribute(visualization, 1, "attribute"),
                2,
                "attribute",
            );

            expect(generateDimensions(visualizationWith2Attributes, VisualizationTypes.TABLE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions for two measures", () => {
            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: [],
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];

            const visualization = singleMeasureInsight;
            const visualizationWith2Measures = addMeasure(visualization, 2);

            expect(generateDimensions(visualizationWith2Measures, VisualizationTypes.TABLE)).toEqual(
                expectedDimensions,
            );
        });

        it("should generate dimensions with totals", () => {
            const expectedTotals: ITotal[] = [
                {
                    alias: "Sum",
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
                {
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "nat",
                },
            ];

            const expectedDimensions: IDimension[] = [
                {
                    itemIdentifiers: [],
                    totals: expectedTotals,
                },
                {
                    itemIdentifiers: ["measureGroup"],
                },
            ];
            const visualization = insightWithProperties;
            const visualizationWithTotals = addTotals(visualization, "attribute", [
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "sum",
                    alias: "Sum",
                },
                {
                    measureIdentifier: "m2",
                    attributeIdentifier: "a1",
                    type: "sum",
                },
                {
                    measureIdentifier: "m1",
                    attributeIdentifier: "a1",
                    type: "nat",
                },
            ]);

            expect(generateDimensions(visualizationWithTotals, VisualizationTypes.TABLE)).toEqual(
                expectedDimensions,
            );
        });
    });
});

describe("generateStackedDimensions", () => {
    it("measure and stack by only", () => {
        const expectedDimensions: IDimension[] = [
            {
                itemIdentifiers: ["a2"],
            },
            {
                itemIdentifiers: ["measureGroup"],
            },
        ];

        const buckets = [
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
                                        uri: "/gdc/md/myproject/obj/m1",
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            {
                localIdentifier: "stack",
                items: [
                    {
                        attribute: {
                            localIdentifier: "a2",
                            displayForm: {
                                uri: "/gdc/md/myproject/obj/a2",
                            },
                        },
                    },
                ],
            },
        ];

        expect(generateStackedDimensions(newInsight(buckets))).toEqual(expectedDimensions);
    });

    it("should return 2 attributes along with measureGroup", () => {
        const buckets = [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/storybook/obj/1",
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
                        attribute: {
                            displayForm: {
                                uri: "/gdc/md/storybook/obj/1.df",
                            },
                            localIdentifier: "a1",
                        },
                    },
                    {
                        attribute: {
                            displayForm: {
                                uri: "/gdc/md/storybook/obj/2.df",
                            },
                            localIdentifier: "a2",
                        },
                    },
                ],
            },
            {
                localIdentifier: "stack",
                items: [],
            },
        ];
        const expectedDimensions: IDimension[] = [
            {
                itemIdentifiers: [],
            },
            {
                itemIdentifiers: ["a1", "a2", "measureGroup"],
            },
        ];
        expect(generateStackedDimensions(newInsight(buckets))).toEqual(expectedDimensions);
    });

    it("should return 2 attributes along with measureGroup and return 1 stack attribute", () => {
        const buckets = [
            {
                localIdentifier: "measures",
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: "/gdc/md/storybook/obj/1",
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
                        attribute: {
                            displayForm: {
                                uri: "/gdc/md/storybook/obj/1.df",
                            },
                            localIdentifier: "a1",
                        },
                    },
                    {
                        attribute: {
                            displayForm: {
                                uri: "/gdc/md/storybook/obj/3.df",
                            },
                            localIdentifier: "a3",
                        },
                    },
                ],
            },
            {
                localIdentifier: "stack",
                items: [
                    {
                        attribute: {
                            displayForm: {
                                uri: "/gdc/md/storybook/obj/2.df",
                            },
                            localIdentifier: "a2",
                        },
                    },
                ],
            },
        ];
        const expectedDimensions: IDimension[] = [
            {
                itemIdentifiers: ["a2"],
            },
            {
                itemIdentifiers: ["a1", "a3", "measureGroup"],
            },
        ];
        expect(generateStackedDimensions(newInsight(buckets))).toEqual(expectedDimensions);
    });
});
