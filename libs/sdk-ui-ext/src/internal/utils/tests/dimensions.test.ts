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
    newTotal,
    newMeasure,
    uriRef,
    newAttribute,
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
    const measure = newMeasure(uriRef(`/gdc/md/myproject/obj/150${index}`), (m) =>
        m.localId(`m${index}`).title(`# Users Opened AD ${index}`),
    );

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
    const attribute = newAttribute(uriRef(`/gdc/md/myproject/obj/400${index}`), (a) =>
        a.localId(`a${index}`),
    );

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
    it("should return row attributes in the first dimensions, column attributes and measureGroup in second dimension", () => {
        const buckets = [
            newBucket(
                BucketNames.MEASURES,
                newMeasure(uriRef("/gdc/md/myproject/obj/m1"), (m) =>
                    m.localId("m1").title("# Accounts with AD Query"),
                ),
            ),
            newBucket(
                BucketNames.ATTRIBUTE,
                newAttribute(uriRef("/gdc/md/myproject/obj/a1"), (a) => a.localId("a1")),
            ),
            newBucket(
                BucketNames.COLUMNS,
                newAttribute(uriRef("/gdc/md/myproject/obj/a2"), (a) => a.localId("a2")),
            ),
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
            const visualizationWithViewAttribute = addAttribute(visualization, 1, BucketNames.VIEW);

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.COLUMN),
            ).toMatchSnapshot();
            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.BAR),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithStackAttribute = addAttribute(visualization, 1, BucketNames.STACK);

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
                addAttribute(visualization, 1, BucketNames.VIEW),
                2,
                BucketNames.STACK,
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
            const visualizationWithViewAttribute = addAttribute(visualization, 1, BucketNames.VIEW);
            const dimensions = generateDimensions(visualizationWithViewAttribute, VisualizationTypes.AREA);

            expect(dimensions).toMatchSnapshot();
        });

        it("should generate dimensions for area with one measure and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithStackAttribute = addAttribute(visualization, 1, BucketNames.STACK);
            const dimensions = generateDimensions(visualizationWithStackAttribute, VisualizationTypes.AREA);

            expect(dimensions).toMatchSnapshot();
        });

        it("should generate dimensions for area with one measure, view attribute and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, BucketNames.VIEW),
                2,
                BucketNames.STACK,
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
                addAttribute(visualization, 1, BucketNames.VIEW),
                2,
                BucketNames.VIEW,
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
            const visualizationWithViewAttribute = addAttribute(visualization, 1, BucketNames.VIEW);

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.HEATMAP),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithStackAttribute = addAttribute(visualization, 1, BucketNames.STACK);

            expect(
                generateDimensions(visualizationWithStackAttribute, VisualizationTypes.HEATMAP),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure, view attribute and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, BucketNames.VIEW),
                2,
                BucketNames.STACK,
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
            const visualizationWithViewAttribute = addAttribute(visualization, 1, BucketNames.TREND);

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.LINE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAttribute = addAttribute(visualization, 1, BucketNames.SEGMENT);

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.LINE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure, view attribute and stack attribute", () => {
            const visualization = singleMeasureInsight;
            const visualizationWithViewAndStackAttribute = addAttribute(
                addAttribute(visualization, 1, BucketNames.TREND),
                2,
                BucketNames.SEGMENT,
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
            const visualizationWithViewAttribute = addAttribute(visualization, 1, BucketNames.VIEW);

            expect(
                generateDimensions(visualizationWithViewAttribute, VisualizationTypes.PIE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and 2 view attributes", () => {
            const visualization = singleMeasureInsight;
            const visualizationWith2ViewAttributes = addAttribute(
                addAttribute(visualization, 1, BucketNames.VIEW),
                2,
                BucketNames.VIEW,
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
            const visualizationWithViewAttribute = addAttribute(visualization, 1, BucketNames.VIEW);

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
            const visualizationWithAttribute = addAttribute(visualization, 1, BucketNames.ATTRIBUTE);

            expect(
                generateDimensions(visualizationWithAttribute, VisualizationTypes.TABLE),
            ).toMatchSnapshot();
        });

        it("should generate dimensions for one measure and 2 attributes", () => {
            const visualization = singleMeasureInsight;
            const visualizationWith2Attributes = addAttribute(
                addAttribute(visualization, 1, BucketNames.ATTRIBUTE),
                2,
                BucketNames.ATTRIBUTE,
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
            const visualizationWithTotals = addTotals(visualization, BucketNames.ATTRIBUTE, [
                newTotal("sum", "m1", "a1", "Sum"),
                newTotal("sum", "m2", "a1"),
                newTotal("nat", "m1", "a1"),
            ]);

            expect(generateDimensions(visualizationWithTotals, VisualizationTypes.TABLE)).toMatchSnapshot();
        });
    });
});

describe("generateStackedDimensions", () => {
    it("measure and stack by only", () => {
        const buckets = [
            newBucket(
                BucketNames.MEASURES,
                newMeasure(uriRef("/gdc/md/myproject/obj/m1"), (m) =>
                    m.localId("m1").title("# Accounts with AD Query"),
                ),
            ),
            newBucket(
                BucketNames.STACK,
                newAttribute(uriRef("/gdc/md/myproject/obj/a2"), (a) => a.localId("a2")),
            ),
        ];

        expect(generateStackedDimensions(newInsight(buckets))).toMatchSnapshot();
    });

    it("should return 2 attributes along with measureGroup", () => {
        const buckets = [
            newBucket(
                BucketNames.MEASURES,
                newMeasure(uriRef("/gdc/md/storybook/obj/m1"), (m) => m.localId("m1")),
            ),
            newBucket(
                BucketNames.ATTRIBUTE,
                newAttribute(uriRef("/gdc/md/storybook/obj/1.df"), (a) => a.localId("a1")),
                newAttribute(uriRef("/gdc/md/storybook/obj/2.df"), (a) => a.localId("a2")),
            ),
            newBucket(BucketNames.STACK),
        ];

        expect(generateStackedDimensions(newInsight(buckets))).toMatchSnapshot();
    });

    it("should return 2 attributes along with measureGroup and return 1 stack attribute", () => {
        const buckets = [
            newBucket(
                BucketNames.MEASURES,
                newMeasure(uriRef("/gdc/md/storybook/obj/m1"), (m) => m.localId("m1")),
            ),
            newBucket(
                BucketNames.ATTRIBUTE,
                newAttribute(uriRef("/gdc/md/storybook/obj/1.df"), (a) => a.localId("a1")),
                newAttribute(uriRef("/gdc/md/storybook/obj/3.df"), (a) => a.localId("a3")),
            ),
            newBucket(
                BucketNames.STACK,
                newAttribute(uriRef("/gdc/md/storybook/obj/2.df"), (a) => a.localId("a2")),
            ),
        ];

        expect(generateStackedDimensions(newInsight(buckets))).toMatchSnapshot();
    });
});
