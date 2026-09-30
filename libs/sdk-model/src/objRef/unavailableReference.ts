// (C) 2026 GoodData Corporation

import { type ObjRef, type ObjectType } from "./index.js";

/**
 * Reason why a referenced object is unavailable.
 *
 * @remarks
 * "forbidden" means the object exists but the current user lacks permission to read it;
 * "notFound" means the object does not exist (deleted or dangling reference).
 *
 * @alpha
 */
export type UnavailableReferenceReason = "forbidden" | "notFound";

/**
 * A referenced object that could not be returned.
 *
 * @alpha
 */
export interface IUnavailableReference {
    /**
     * Reference to the unavailable object.
     */
    ref: ObjRef;

    /**
     * Type of the unavailable object.
     */
    type: ObjectType;

    /**
     * Why the object could not be returned.
     */
    reason: UnavailableReferenceReason;
}
