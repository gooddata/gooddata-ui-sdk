// (C) 2019 GoodData Corporation
import { AttributeOrMeasure, IBucket, IFilter, IInsight } from "@gooddata/sdk-model";
import {
    defWithFilters,
    IExecutionDefinition,
    IExecutionFactory,
    IPreparedExecution,
} from "@gooddata/sdk-backend-spi";

export class ExecutionFactoryWithPresetFilters implements IExecutionFactory {
    constructor(
        private readonly factory: IExecutionFactory,
        private readonly presetFilters: IFilter[] = [],
    ) {}

    public forDefinition = (def: IExecutionDefinition): IPreparedExecution => {
        return this.factory.forDefinition(defWithFilters(def, this.presetFilters));
    };
    public forItems = (items: AttributeOrMeasure[], filters: IFilter[] = []): IPreparedExecution => {
        return this.factory.forItems(items, [...this.presetFilters, ...filters]);
    };
    public forBuckets = (buckets: IBucket[], filters: IFilter[] = []): IPreparedExecution => {
        return this.factory.forBuckets(buckets, [...this.presetFilters, ...filters]);
    };
    public forInsight = (insight: IInsight, filters: IFilter[] = []): IPreparedExecution => {
        return this.factory.forInsight(insight, [...this.presetFilters, ...filters]);
    };
    public forInsightByRef = (uri: string, filters: IFilter[] = []): Promise<IPreparedExecution> => {
        return this.factory.forInsightByRef(uri, [...this.presetFilters, ...filters]);
    };
}
