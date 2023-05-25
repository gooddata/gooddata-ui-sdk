// (C) 2020-2022 GoodData Corporation
import identity from "lodash/identity.js";
import { IInsightDefinition, VisualizationProperties } from "./index.js";
import { IBucket } from "../execution/buckets/index.js";
import { IFilter } from "../execution/filter/index.js";
import { ISortItem } from "../execution/base/sort.js";

/*
 * Factory & builder for insight instances. Keeping it in test infrastructure for now, will see later on
 * whether we should move it to prod code and expose on public API.
 */

/**
 * Creates new, empty insight definition, modifying its content with given modifications.
 *
 * @param visualizationUrl - visualization URL (e.g. local:bar, local:table..)
 * @param modifications - modification function which will be called with builder to update the insight
 * @internal
 */
export function newInsightDefinition(
    visualizationUrl: string,
    modifications: InsightModifications = identity,
): IInsightDefinition {
    const builder = new InsightDefinitionBuilder(visualizationUrl);

    return modifications(builder).build();
}

/**
 * @internal
 */
export type InsightModifications = (builder: InsightDefinitionBuilder) => InsightDefinitionBuilder;

/**
 * Insight definition builder can be used to set various properties of the insight using fluent API.
 *
 * @internal
 */
export class InsightDefinitionBuilder {
    private insight: IInsightDefinition["insight"];

    constructor(visualizationUrl: string) {
        this.insight = {
            visualizationUrl,
            title: "Untitled",
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
        };
    }

    public title = (title: string): InsightDefinitionBuilder => {
        this.insight.title = title;

        return this;
    };

    public buckets = (buckets: IBucket[]): InsightDefinitionBuilder => {
        this.insight.buckets = buckets;

        return this;
    };

    public filters = (filters: IFilter[]): InsightDefinitionBuilder => {
        this.insight.filters = filters;

        return this;
    };

    public sorts = (sorts: ISortItem[]): InsightDefinitionBuilder => {
        this.insight.sorts = sorts;

        return this;
    };

    public properties = (properties: VisualizationProperties): InsightDefinitionBuilder => {
        this.insight.properties = properties;

        return this;
    };

    public build = (): IInsightDefinition => {
        return {
            insight: this.insight,
        };
    };
}
