// (C) 2026 GoodData Corporation

import { type RestrictedObject } from "@gooddata/api-client-tiger";
import { type IUnavailableReference, idRef } from "@gooddata/sdk-model";

import { type TigerCompatibleObjectType, objectTypeToTigerIdType } from "../../types/refTypeMapping.js";

/**
 * The shared reading of object-level restrictions in JSON:API documents.
 *
 * Contract: Tiger lists the references withheld from `included` under document-level
 * `meta.restricted` and keeps their `relationships` entries. A restricted reference belongs to an
 * entity when the entity's relationship, requested by the matching include, links it. Missing
 * `meta.restricted` means no permission filtering applies and must never be read as a denial.
 */

interface ILinkage {
    id: string;
    type: string;
}

function isLinkage(value: unknown): value is ILinkage {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as ILinkage).id === "string" &&
        typeof (value as ILinkage).type === "string"
    );
}

/**
 * Ids linked by the entity's relationship stored under the given key.
 * Handles both to-many (array of linkages) and to-one (single linkage or null) relationships.
 */
export function getRelationshipIds(relationships: object | undefined, key: string): Set<string> {
    const data: unknown = (relationships as Partial<Record<string, { data?: unknown }>> | undefined)?.[key]
        ?.data;
    const linkages: unknown[] = Array.isArray(data) ? data : [data];
    return new Set(linkages.filter(isLinkage).map((linkage) => linkage.id));
}

/**
 * Restricted objects of the given type among the related ids; `excludedId` skips the entity itself.
 */
export function getForbiddenReferences(
    type: TigerCompatibleObjectType,
    relatedIds: Set<string>,
    restricted: RestrictedObject[],
    excludedId?: string,
): IUnavailableReference[] {
    const tigerType = objectTypeToTigerIdType[type];
    return restricted
        .filter(
            (object) => object.type === tigerType && object.id !== excludedId && relatedIds.has(object.id),
        )
        .map((object) => ({ ref: idRef(object.id, type), type, reason: "forbidden" }));
}
