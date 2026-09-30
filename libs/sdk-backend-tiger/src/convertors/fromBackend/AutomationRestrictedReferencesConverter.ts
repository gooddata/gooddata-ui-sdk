// (C) 2026 GoodData Corporation

import {
    type EntitiesApiGetAllEntitiesAutomationsRequest,
    type JsonApiAutomationOutWithLinks,
    type JsonApiWorkspaceAutomationOutWithLinks,
    type RestrictedObject,
} from "@gooddata/api-client-tiger";
import { type IUnavailableReference } from "@gooddata/sdk-model";

import { type TigerCompatibleObjectType } from "../../types/refTypeMapping.js";

import { getForbiddenReferences, getRelationshipIds } from "./RestrictedReferencesConverter.js";

type AutomationInclude = NonNullable<EntitiesApiGetAllEntitiesAutomationsRequest["include"]>[number];

/**
 * Object types whose restricted references lock an automation, each with the include that links them;
 * the include also names the relationship in the response. The automations query requests these
 * includes, so covering another type means adding it here once the backend links it to automations.
 */
export const AUTOMATION_RESTRICTION_INCLUDES = {
    insight: "visualizationObjects",
} as const satisfies Partial<Record<TigerCompatibleObjectType, AutomationInclude>>;

type InspectedType = keyof typeof AUTOMATION_RESTRICTION_INCLUDES;

/**
 * Restricted objects of the response that the automation uses.
 * Returns undefined when the response carries no restriction data.
 */
export function resolveAutomationUnavailableReferences(
    automation: JsonApiAutomationOutWithLinks | JsonApiWorkspaceAutomationOutWithLinks,
    restricted: RestrictedObject[] | undefined,
): IUnavailableReference[] | undefined {
    if (!restricted) {
        return undefined;
    }

    const inspectedTypes = Object.keys(AUTOMATION_RESTRICTION_INCLUDES) as InspectedType[];
    return inspectedTypes.flatMap((type) =>
        getForbiddenReferences(
            type,
            getRelationshipIds(automation.relationships, AUTOMATION_RESTRICTION_INCLUDES[type]),
            restricted,
        ),
    );
}
