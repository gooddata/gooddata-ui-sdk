// (C) 2026 GoodData Corporation

import type { IGenAIUserContext } from "@gooddata/sdk-model";

export function buildContext(props: Partial<IGenAIUserContext>): IGenAIUserContext {
    return {
        ...props,
    };
}

/**
 * @internal
 */
export function mergeContexts(...contexts: IGenAIUserContext[]): IGenAIUserContext {
    return contexts.reduce((acc, context) => {
        return {
            view: context.view ?? acc.view,
            activeObject: context.activeObject ?? acc.activeObject,
            referencedObjects: [...(acc?.referencedObjects ?? []), ...(context?.referencedObjects ?? [])],
        };
    }, {});
}
