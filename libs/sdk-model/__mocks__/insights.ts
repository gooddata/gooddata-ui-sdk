// (C) 2019 GoodData Corporation
import { ISortItem, uriRef, VisualizationProperties } from "../src/index.js";
import { IBucket } from "../src/execution/buckets/index.js";
import { IInsight } from "../src/insight/index.js";
import { IFilter } from "../src/execution/filter/index.js";
import identity from "lodash/identity.js";

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
        };
    }

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
