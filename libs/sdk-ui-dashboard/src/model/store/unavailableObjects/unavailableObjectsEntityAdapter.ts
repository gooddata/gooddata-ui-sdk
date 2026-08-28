// (C) 2026 GoodData Corporation

import { type EntityId, createEntityAdapter } from "@reduxjs/toolkit";

import type { IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type ObjRef, type ObjectType, objRefToString } from "@gooddata/sdk-model";

/**
 * Objects of different types may share an identifier, so entries are keyed by type as well.
 */
export function unavailableObjectKey(type: ObjectType, ref: ObjRef): string {
    return `${type}|${objRefToString(ref)}`;
}

export const unavailableObjectsEntityAdapter = createEntityAdapter<IUnavailableDashboardReference, EntityId>({
    selectId: (reference) => unavailableObjectKey(reference.type, reference.ref),
});
