// (C) 2026 GoodData Corporation

import { type IGenAIObjectReferenceGroup, areObjRefsEqual } from "@gooddata/sdk-model";

import { type IGenAIContextObject, type StoreContext } from "../types.js";
import { convertGenAiTypeToReferenceType } from "../utils.js";

export function addContextReference(context: StoreContext, reference?: IGenAIContextObject): StoreContext {
    const { active } = context;

    if (!reference) {
        return context;
    }

    if (reference.where === "view.dashboard") {
        return {
            ...context,
            active: {
                ...active,
                view: {
                    ...active?.view,
                    dashboard: context.ambient?.view?.dashboard,
                },
            },
        };
    }

    if (reference.where === "referencedObjects") {
        const refContext = reference.context;
        const referencedObjects = (active?.referencedObjects ?? []).slice();

        const index = referencedObjects.findIndex(
            (obj) => areObjRefsEqual(obj.context?.ref, refContext?.ref) || obj.context === refContext,
        );

        let group: IGenAIObjectReferenceGroup;
        if (index === -1) {
            group = {
                context: refContext,
                objects: [],
            };
            referencedObjects.push(group);
        } else {
            const item = referencedObjects[index];
            group = {
                ...item,
                context: item.context,
                objects: item.objects.slice(),
            };
            referencedObjects[index] = group;
        }

        group.objects.push({
            ref: reference.ref,
            title: reference.title,
            type: convertGenAiTypeToReferenceType(reference.type),
        });

        return {
            ...context,
            active: {
                ...active,
                referencedObjects,
            },
        };
    }

    return context;
}
