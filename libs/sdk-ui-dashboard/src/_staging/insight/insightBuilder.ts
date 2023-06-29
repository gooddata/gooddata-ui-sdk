// (C) 2019-2021 GoodData Corporation

import identity from "lodash/identity.js";
import { IBucket, IFilter, IInsight, ISortItem, uriRef, VisualizationProperties } from "@gooddata/sdk-model";

/**
 * Factory & builder for insight instances. Keeping it in test infrastructure for now, will see later on
 * whether we should move it to prod code and expose on public API.
 *
 * TODO: this together with the `newInsightDefinition` should be moved into a new test utilities package that
 *  should live under `tools`. neither of these functions/builders make sense in the production code because they
 *  lack the logic that ensures that a correct insight is created. These two things are really useful only for
 *  convenient creation of test fixtures.
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
