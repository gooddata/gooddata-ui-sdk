// (C) 2025 GoodData Corporation

import { IAttribute, IExecutionDefinition, isAttribute } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

/**
 * Extracts the first area attribute from execution buckets.
 */
export function resolveAreaAttributeFromDefinition(
    definition?: IExecutionDefinition,
): IAttribute | undefined {
    if (!definition) {
        return undefined;
    }

    const areaBucket = definition.buckets?.find((bucket) => bucket.localIdentifier === BucketNames.AREA);
    if (!areaBucket) {
        return undefined;
    }

    return areaBucket.items.find(isAttribute) as IAttribute | undefined;
}

/**
 * Returns explicitly provided area attribute or falls back to execution buckets.
 */
export function resolveEffectiveAreaAttribute(
    area: IAttribute | undefined,
    definition?: IExecutionDefinition,
): IAttribute | undefined {
    if (area) {
        return area;
    }

    return resolveAreaAttributeFromDefinition(definition);
}
