// (C) 2026 GoodData Corporation

import type {
    IGenAIObjectReference,
    IGenAIObjectReferenceGroup,
    IGenAIUserContext,
} from "@gooddata/sdk-model";

import { buildContext } from "./build.js";

/**
 * @internal
 */
export function buildReferencedContext(referencedObjects: IGenAIObjectReferenceGroup[]): IGenAIUserContext {
    return buildContext({
        referencedObjects,
    });
}

/**
 * @internal
 */
export function buildReferenceContext(
    objects: IGenAIObjectReference[],
    context?: IGenAIObjectReference,
): IGenAIObjectReferenceGroup {
    return {
        context,
        objects,
    };
}
