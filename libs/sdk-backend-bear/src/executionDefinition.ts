// (C) 2019 GoodData Corporation
import {
    AttributeOrMeasure,
    bucketsAttributes,
    bucketsMeasures,
    IBucket,
    IFilter,
    IInsight,
    insightBuckets,
    insightFilters,
    isAttribute,
    isMeasure,
} from "@gooddata/sdk-model";
import { IExecutionDefinition } from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";

export function newDefFromItems(workspace: string, items: AttributeOrMeasure[]): IExecutionDefinition {
    return {
        workspace,
        buckets: [],
        attributes: items.filter(isAttribute),
        measures: items.filter(isMeasure),
        dimensions: [],
        filters: [],
        sortBy: [],
        totals: [],
    };
}

export function newDefFromBuckets(workspace: string, buckets: IBucket[]): IExecutionDefinition {
    return {
        workspace,
        buckets,
        attributes: bucketsAttributes(buckets),
        measures: bucketsMeasures(buckets),
        dimensions: [],
        filters: [],
        sortBy: [],
        totals: [],
    };
}

export function newDefFromInsight(workspace: string, insight: IInsight): IExecutionDefinition {
    const def = newDefFromBuckets(workspace, insightBuckets(insight));

    return defWithFilters(def, insightFilters(insight));
}

export function defWithFilters(def: IExecutionDefinition, filters?: IFilter[]): IExecutionDefinition {
    if (!filters || isEmpty(filters)) {
        return def;
    }

    return {
        ...def,
        filters,
    };
}

export function defFingerprint(_def: IExecutionDefinition): string {
    return "haluz";
}
