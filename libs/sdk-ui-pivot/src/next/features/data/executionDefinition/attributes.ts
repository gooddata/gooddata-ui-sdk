// (C) 2025 GoodData Corporation
import { IAttribute, IDimension, attributeLocalId, newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { IPivotTableExecutionDefinition } from "./types.js";

/**
 * Applies provided attributes to execution definition.
 *
 * @internal
 */
export const applyAttributesToExecutionDef =
    ({ rows, columns }: { rows: IAttribute[]; columns: IAttribute[] }) =>
    (executionDefinition: IPivotTableExecutionDefinition): IPivotTableExecutionDefinition => {
        if (rows.length === 0 && columns.length === 0) {
            return executionDefinition;
        }

        const [rowsDimension, columnsDimension] = executionDefinition.dimensions;
        const [measuresBucket, _rowsBucket, _columnsBucket] = executionDefinition.buckets;
        const attributes = rows.concat(columns);

        return {
            ...executionDefinition,
            attributes,
            dimensions: [
                addAttributesToDimension(rowsDimension, rows),
                addAttributesToDimension(columnsDimension, columns),
            ],
            buckets: [
                measuresBucket,
                newBucket(BucketNames.ATTRIBUTE, ...rows),
                newBucket(BucketNames.COLUMNS, ...columns),
            ],
        };
    };

function addAttributesToDimension(dimension: IDimension, attributes: IAttribute[]) {
    return {
        ...dimension,
        itemIdentifiers: [...dimension.itemIdentifiers, ...attributes.map(attributeLocalId)],
    };
}
