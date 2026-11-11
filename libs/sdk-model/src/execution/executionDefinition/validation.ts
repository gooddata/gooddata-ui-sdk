// (C) 2021-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import { _groupBy } from "@gooddata/util";

import { attributeLocalId, isAttribute } from "../attribute/index.js";
import { measureLocalId } from "../measure/index.js";

import { type IExecutionDefinition } from "./index.js";

/**
 * Validates the {@link IExecutionDefinition} instance and throws if it is invalid.
 * @param definition - the definition to validate
 * @internal
 */
export function defValidate(definition: IExecutionDefinition): void {
    const itemsWithLocalId = [...definition.attributes, ...definition.measures];

    const groups = _groupBy(itemsWithLocalId, (item) =>
        isAttribute(item) ? attributeLocalId(item) : measureLocalId(item),
    );

    Object.entries(groups).forEach(([localId, items]) => {
        invariant(
            items.length === 1,
            `There are ${items.length} items with the same localId '${localId}'. Please make sure the attributes and measures in the execution definition have unique localIds.`,
        );
    });
}
