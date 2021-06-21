// (C) 2021 GoodData Corporation
import groupBy from "lodash/groupBy";
import toPairs from "lodash/toPairs";
import invariant from "ts-invariant";

import { attributeLocalId, isAttribute } from "../attribute";
import { measureLocalId } from "../measure";

import { IExecutionDefinition } from "./index";

/**
 * Validates the {@link IExecutionDefinition} instance and throws if it is invalid.
 * @param definition - the definition to validate
 * @internal
 */
export function defValidate(definition: IExecutionDefinition): void {
    const itemsWithLocalId = [...definition.attributes, ...definition.measures];

    const groups = groupBy(itemsWithLocalId, (item) =>
        isAttribute(item) ? attributeLocalId(item) : measureLocalId(item),
    );

    toPairs(groups).forEach(([localId, items]) => {
        invariant(
            items.length === 1,
            `There are ${items.length} items with the same localId '${localId}'. Please make sure the attributes and measures in the execution definition have unique localIds.`,
        );
    });
}
