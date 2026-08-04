// (C) 2026 GoodData Corporation

import {
    type IGenAIActiveObject,
    type IGenAIDashboardContext,
    type IGenAIUserContext,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

export function buildContext(props: Partial<IGenAIUserContext>): IGenAIUserContext {
    return {
        ...props,
    };
}

/**
 * @internal
 */
export function undefinedIfEmpty<T extends object>(value: T): T | undefined {
    return Object.keys(value).length > 0 ? value : undefined;
}

/**
 * @internal
 */
export function mergeContexts(...contexts: (IGenAIUserContext | undefined)[]): IGenAIUserContext | undefined {
    const merged = contexts.reduce<IGenAIUserContext>((acc, context) => {
        if (!context) {
            return acc;
        }

        const dashboard = mergeDashboard(context.view?.dashboard, acc.view?.dashboard);
        const view = {
            ...(dashboard ? { dashboard } : {}),
        };

        const activeObject = mergeActiveObject(context.activeObject, acc.activeObject);
        const referencedObjects = [...(acc?.referencedObjects ?? []), ...(context?.referencedObjects ?? [])];

        return {
            ...(Object.keys(view).length > 0 ? { view } : {}),
            ...(activeObject ? { activeObject } : {}),
            ...(referencedObjects.length > 0 ? { referencedObjects } : {}),
        };
    }, {});

    return undefinedIfEmpty(merged);
}

function mergeDashboard(
    dashboard?: IGenAIDashboardContext,
    existingDashboard?: IGenAIDashboardContext,
): IGenAIDashboardContext | undefined {
    if (areObjRefsEqual(dashboard?.ref, existingDashboard?.ref)) {
        const merged = {
            ...existingDashboard,
            ...dashboard,
        } as IGenAIDashboardContext;

        return undefinedIfEmpty(merged);
    }
    return dashboard ?? existingDashboard;
}

function mergeActiveObject(
    activeObject?: IGenAIActiveObject,
    existingActiveObject?: IGenAIActiveObject,
): IGenAIActiveObject | undefined {
    if (areObjRefsEqual(activeObject?.ref, existingActiveObject?.ref)) {
        const merged = {
            ...existingActiveObject,
            ...activeObject,
        } as IGenAIActiveObject;

        return undefinedIfEmpty(merged);
    }
    return activeObject ?? existingActiveObject;
}
