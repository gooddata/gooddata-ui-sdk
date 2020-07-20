// (C) 2007-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { VisualizationTypes, BucketNames } from "@gooddata/sdk-ui";
import {
    generateDimensions,
    generateStackedDimensions,
    getHeadlinesDimensions,
    getPivotTableDimensions,
} from "../dimensions";
import {
    bucketsFind,
    IBucket,
    IInsightDefinition,
    insightBucket,
    insightBuckets,
    ITotal,
    newBucket,
    insightSetProperties,
} from "@gooddata/sdk-model";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

const singleMeasureInsight = ReferenceRecordings.Insights.Headline.SingleMeasure.obj as IInsightDefinition;
const singleAttributeInsight = ReferenceRecordings.Insights.PivotTable.SingleAttribute
    .obj as IInsightDefinition;
const insightWithProperties = insightSetProperties(singleMeasureInsight, {
    controls: { xaxis: { visible: true } },
});

/*
 * WARNING: tests in this file rely on mutating insight and mutating buckets. We should revisit all the tests here.
 * Ideally, all these _component_ tests (they test the dimension generator) should use recorded insights; no mutations
 * here. Even further, all these tests should be replaced by a single massive parameterized test taking many
 * different recorded insights and verifying dimensionality.
 */

function getVisualizationBucket(newVis: IInsightDefinition, bucketName: string): IBucket {
    const buckets = insightBuckets(newVis);
    let bucket = bucketsFind(buckets, bucketName);

    if (!bucket) {
        bucket = newBucket(bucketName);
        buckets.push(bucket);
    }

    return bucket;
}

function addMeasure(visualization: IInsightDefinition, index: number): IInsightDefinition {
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

function addAttribute(
    visualization: IInsightDefinition,
    index: number,
    bucketName: string,
): IInsightDefinition {
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

function addTotals(
    visualization: IInsightDefinition,
    bucketName: string,
    newTotals: ITotal[],
): IInsightDefinition {
    const newVis = cloneDeep(visualization);

    const bucket = getVisualizationBucket(newVis, bucketName);

    if (!bucket.totals) {
        bucket.totals = [];
    }

    newTotals.forEach((total) => {
        bucket.totals.push(total);
    });

    return newVis;
}

function newInsight(buckets: IBucket[]): IInsightDefinition {
    return {
        insight: {
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
        expect(getHeadlinesDimensions()).toMatchSnapshot();
    });
});

describe("getPivotTableDimensions", () => {
    // tslint:disable-next-line:max-line-length
    it("should return row attributes in the first dimensions, column attributes and measureGroup in second dimension", () => {
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

        expect(getPivotTableDimensions(newInsight(buckets))).toMatchSnapshot();
    });
});

describe("generateDimensions", () => {
    describe("column/bar chart", () => {
        it("should generate dimensions for one measure", () => {
            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.COLUMN)).toMatchSnapshot();
            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.BAR)).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.COLUMN),
            ).toMatchSnapshot();
            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.BAR),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithStackAttribute = addAttribute(visualization, 1, "stack");

            expect(
                generateDimensions(visualizationWithStackAttribute, VisualizationTypes.COLUMN),
            ).toMatchSnapshot();
            expect(
                generateDimensions(visualizationWithStackAttribute, VisualizationTypes.BAR),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure, view attribute and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, "view"),
                2,
                "stack",
            );

            expect(
                generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.COLUMN),
            ).toMatchSnapshot();
            expect(
                generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.BAR),
            ).toMatchSnapshot();
        });
    });
    describe("area chart", () => {
        it("should generate dimensions for area with one measure", () => {
            const dimensions = generateDimensions(singleMeasureInsight, VisualizationTypes.AREA);
            expect(dimensions).toMatchSnapshot();
        });

        it("should generate dimensions for area with one measure and view attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");
            const dimensions = generateDimensions(visualizationWithViewAttribute, VisualizationTypes.AREA);

            expect(dimensions).toMatchSnapshot();
        });

        it("should generate dimensions for area with one measure and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithStackAttribute = addAttribute(visualization, 1, "stack");
            const dimensions = generateDimensions(visualizationWithStackAttribute, VisualizationTypes.AREA);

            expect(dimensions).toMatchSnapshot();
        });

        it("should generate dimensions for area with one measure, view attribute and stack attribute", () => {
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

            expect(dimensions).toMatchSnapshot();
        });

        it("should generate dimensions for area with one measure, two view attribute", () => {
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

            expect(dimensions).toMatchSnapshot();
        });
    });
    describe("heatmap", () => {
        it("should generate dimensions for one measure", () => {
            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.HEATMAP)).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.HEATMAP),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithStackAttribute = addAttribute(visualization, 1, "stack");

            expect(
                generateDimensions(visualizationWithStackAttribute, VisualizationTypes.HEATMAP),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure, view attribute and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, "view"),
                2,
                "stack",
            );

            expect(
                generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.HEATMAP),
            ).toMatchSnapshot();
        });
    });
    describe("line chart", () => {
        it("should generate dimensions for one measure", () => {
            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.LINE)).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "trend");

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.LINE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "segment");

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.LINE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure, view attribute and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, "trend"),
                2,
                "segment",
            );

            expect(
                generateDimensions(visualizationWithViewAndStackAttribute, VisualizationTypes.LINE),
            ).toMatchSnapshot();
        });
    });
    describe("pie chart", () => {
        it("should generate dimensions for one measure", () => {
            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.PIE)).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.PIE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and 2 view attributes", () => {
            const visualization = singleMeasureInsight;
            const visualizationWith2ViewAttributes = addAttribute(
                addAttribute(visualization, 1, "view"),
                2,
                "view",
            );

            expect(
                generateDimensions(visualizationWith2ViewAttributes, VisualizationTypes.PIE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for two measures", () => {
            const visualization = singleMeasureInsight;
            const visualizationWith2Measures = addMeasure(visualization, 2);

            expect(generateDimensions(visualizationWith2Measures, VisualizationTypes.PIE)).toMatchSnapshot();
        });
    });
    describe("treemap", () => {
        it("should generate dimensions for one measure", () => {
            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.TREEMAP)).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and view attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, "view");

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.TREEMAP),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for two measures", () => {
            const visualization = singleMeasureInsight;
            const visualizationWith2Measures = addMeasure(visualization, 2);

            expect(
                generateDimensions(visualizationWith2Measures, VisualizationTypes.TREEMAP),
            ).toMatchSnapshot();
        });
    });
    describe("table", () => {
        it("should generate dimensions for one measure", () => {
            expect(generateDimensions(singleMeasureInsight, VisualizationTypes.TABLE)).toMatchSnapshot();
        });

        it("should generate dimensions for one attribute", () => {
            expect(generateDimensions(singleAttributeInsight, VisualizationTypes.TABLE)).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithAttribute = addAttribute(visualization, 1, "attribute");

            expect(
                generateDimensions(visualizationWithAttribute, VisualizationTypes.TABLE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and 2 attributes", () => {
            const visualization = singleMeasureInsight;
            const visualizationWith2Attributes = addAttribute(
                addAttribute(visualization, 1, "attribute"),
                2,
                "attribute",
            );

            expect(
                generateDimensions(visualizationWith2Attributes, VisualizationTypes.TABLE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for two measures", () => {
            const visualization = singleMeasureInsight;
            const visualizationWith2Measures = addMeasure(visualization, 2);

            expect(
                generateDimensions(visualizationWith2Measures, VisualizationTypes.TABLE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions with totals", () => {
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

            expect(generateDimensions(visualizationWithTotals, VisualizationTypes.TABLE)).toMatchSnapshot();
        });
    });
});

describe("generateStackedDimensions", () => {
    it("measure and stack by only", () => {
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

        expect(generateStackedDimensions(newInsight(buckets))).toMatchSnapshot();
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

        expect(generateStackedDimensions(newInsight(buckets))).toMatchSnapshot();
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

        expect(generateStackedDimensions(newInsight(buckets))).toMatchSnapshot();
    });
});
