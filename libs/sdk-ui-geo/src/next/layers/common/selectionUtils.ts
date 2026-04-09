// (C) 2025-2026 GoodData Corporation

import { type ObjRef, isIdentifierRef, isUriRef } from "@gooddata/sdk-model";
import { type IDrillEventIntersectionElement, isDrillIntersectionAttributeItem } from "@gooddata/sdk-ui";

import { isRecord } from "../../utils/guards.js";

function getDisplayFormId(ref: ObjRef | undefined): string | undefined {
    if (!ref) {
        return undefined;
    }

    if (isIdentifierRef(ref)) {
        return ref.identifier;
    }

    if (isUriRef(ref)) {
        return ref.uri;
    }

    return undefined;
}

function createSelectionKey(
    attributeId: string | undefined,
    uri: string | undefined,
    value: string | undefined,
): string | undefined {
    if (!attributeId) {
        return undefined;
    }

    if (uri) {
        return `uri:${attributeId}:${uri}`;
    }

    if (value !== undefined) {
        return `value:${attributeId}:${value}`;
    }

    return undefined;
}

function getPayloadSelectionKeys(payload: unknown): string[] {
    if (!isRecord(payload)) {
        return [];
    }

    const attributeId = typeof payload["attrId"] === "string" ? payload["attrId"] : undefined;
    const value = typeof payload["value"] === "string" ? payload["value"] : undefined;
    const uri = typeof payload["uri"] === "string" ? payload["uri"] : undefined;
    const uris = Array.isArray(payload["uris"])
        ? payload["uris"].filter((item): item is string => typeof item === "string")
        : [];

    const keys = uris
        .map((item) => createSelectionKey(attributeId, item, value))
        .filter((item): item is string => item !== undefined);
    if (keys.length > 0) {
        return keys;
    }

    const key = createSelectionKey(attributeId, uri, value);
    return key ? [key] : [];
}

export function getSelectedIntersections(
    selectedPoints: IDrillEventIntersectionElement[][] | undefined,
): string[][] | undefined {
    if (!selectedPoints?.length) {
        return undefined;
    }

    const intersections = selectedPoints
        .map((intersection) =>
            intersection.flatMap((element) => {
                if (!isDrillIntersectionAttributeItem(element.header)) {
                    return [];
                }

                const attributeId =
                    element.header.attributeHeader.identifier ??
                    getDisplayFormId(element.header.attributeHeader.ref);
                const value = element.header.attributeHeaderItem.name ?? undefined;
                const uri = element.header.attributeHeaderItem.uri ?? undefined;
                const key = createSelectionKey(attributeId, uri, value);

                return key ? [key] : [];
            }),
        )
        .filter((intersection) => intersection.length > 0);

    return intersections.length > 0 ? intersections : undefined;
}

export function isFeatureSelected(
    properties: GeoJSON.GeoJsonProperties,
    selectedIntersections: string[][],
): boolean {
    const featureKeys = new Set([
        ...getPayloadSelectionKeys(properties?.["locationName"]),
        ...getPayloadSelectionKeys(properties?.["segment"]),
    ]);

    return selectedIntersections.some((intersection) => intersection.every((key) => featureKeys.has(key)));
}
