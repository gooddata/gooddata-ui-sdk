// (C) 2019-2021 GoodData Corporation
import identity from "lodash/identity";
import {
    IBucket,
    IFilter,
    IInsight,
    ISortItem,
    newBucket,
    newMeasure,
    uriRef,
    VisualizationProperties,
} from "@gooddata/sdk-model";

/*
 * Factory & builder for insight instances. Keeping it in test infrastructure for now, will see later on
 * whether we should move it to prod code and expose on public API.
 */

export function newInsight(visClassId: string, modifications: InsightsModifications = identity): IInsight {
    const builder = new InsightBuilder(visClassId);

    return modifications(builder).build();
}

export type InsightsModifications = (builder: InsightBuilder) => InsightBuilder;

export class InsightBuilder {
    private insight: IInsight["insight"];

    constructor(visClassUri: string) {
        this.insight = {
            visualizationUrl: visClassUri,
            title: "Untitled",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
            identifier: "random",
            uri: "random",
            ref: uriRef("random"),
            isLocked: false,
        };
    }

    public uri = (uri: string): InsightBuilder => {
        this.insight.uri = uri;
        this.insight.ref = uriRef(uri);

        return this;
    };

    public identifier = (identifier: string): InsightBuilder => {
        this.insight.identifier = identifier;

        return this;
    };

    public title = (title: string): InsightBuilder => {
        this.insight.title = title;

        return this;
    };

    public buckets = (buckets: IBucket[]): InsightBuilder => {
        this.insight.buckets = buckets;

        return this;
    };

    public filters = (filters: IFilter[]): InsightBuilder => {
        this.insight.filters = filters;

        return this;
    };

    public sorts = (sorts: ISortItem[]): InsightBuilder => {
        this.insight.sorts = sorts;

        return this;
    };

    public properties = (properties: VisualizationProperties): InsightBuilder => {
        this.insight.properties = properties;

        return this;
    };

    public isLocked = (isLocked: boolean): InsightBuilder => {
        this.insight.isLocked = isLocked;

        return this;
    };

    public created = (created: string): InsightBuilder => {
        this.insight.created = created;

        return this;
    };

    public updated = (updated: string): InsightBuilder => {
        this.insight.updated = updated;

        return this;
    };

    public build = (): IInsight => {
        return {
            insight: this.insight,
        };
    };
}

export const MockColumnChartInsight = newInsight("local:column", (i) =>
    i
        .identifier("my_visualization_b")
        .uri("/gdc/md/mockproject/obj/my_visualization_b")
        .title("My visualization B")
        .buckets([
            newBucket(
                "measures",
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.amount"), (m) =>
                    m.title("Metric A").localId("m1"),
                ),
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.account"), (m) =>
                    m.title("Metric B").localId("m2"),
                ),
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.vendor"), (m) =>
                    m.title("Metric B").localId("m3"),
                ),
            ),
        ])
        .properties({
            controls: {
                dataLabels: { visible: true },
                legend: { enabled: false },
            },
        }),
);

export const MockBarChartInsight = newInsight("local:bar", (i) =>
    i
        .identifier("my_visualization_a")
        .uri("/gdc/md/mockproject/obj/my_visualization_a")
        .title("My visualization A")
        .buckets([
            newBucket(
                "measures",
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.amount"), (m) =>
                    m.title("Metric A").localId("m1"),
                ),
                newMeasure(uriRef("/gdc/md/mockproject/obj/metric.account"), (m) =>
                    m.title("Metric B").localId("m2"),
                ),
            ),
        ])
        .properties({
            controls: {
                dataLabels: { visible: true },
                legend: { enabled: false },
            },
        }),
);

export const MockBarChartVisClass = {
    visualizationClass: {
        checksum: "local",
        icon: "local:bar",
        iconSelected: "local:bar.selected",
        url: "local:bar",
        identifier: "bar",
        orderIndex: 0,
        title: "Bar",
        uri: "/gdc/md/mockproject/obj/bar",
    },
};
