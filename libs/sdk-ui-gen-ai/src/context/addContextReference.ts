// (C) 2026 GoodData Corporation

import {
    type IGenAIObjectReferenceGroup,
    type IGenAIUserContext,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { type IGenAIContextObject, type StoreContext } from "../types.js";
import { convertGenAiTypeToReferenceType } from "../utils.js";

import { mergeContexts } from "./build.js";
import { isReferenceChanged } from "./isReferenceChanged.js";
import { removeAmbientContribution } from "./removeContextReference.js";

export function addContextReference(context: StoreContext, reference?: IGenAIContextObject): StoreContext {
    const { ambient, active } = context;

    if (!reference) {
        return context;
    }

    if (reference.where === "view.dashboard" && ambient?.view?.dashboard) {
        const ambientDashboard = ambient.view.dashboard;
        if (areObjRefsEqual(ambientDashboard.ref, reference.ref)) {
            return {
                ...context,
                active: {
                    ...active,
                    view: {
                        dashboard: ambientDashboard,
                    },
                },
            };
        }
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

export function addAmbientContextReferences(
    context: StoreContext,
    userContext?: IGenAIUserContext,
): StoreContext {
    const referenceChanged = isReferenceChanged(context.ambient, userContext);
    const updateActive = Boolean(!context.ambient || context.active?.view?.dashboard || referenceChanged);

    return {
        ...context,
        ambient: userContext,
        ...(updateActive
            ? {
                  active: mergeContexts(
                      referenceChanged
                          ? removeAmbientContribution(context.active, context.ambient)
                          : context.active,
                      userContext,
                  ),
              }
            : {}),
    };
}
