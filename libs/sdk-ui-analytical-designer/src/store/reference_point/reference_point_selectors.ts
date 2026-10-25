// (C) 2026 GoodData Corporation

import { type IRawBuckets } from "../../typings/buckets.js";
import { type IAppState } from "../types.js";

import { type IExtendedReferencePointState } from "./extended_reference_point_state.js";
import { type IRefPointFiltersBucket, type IReferencePointState } from "./reference_point_state.js";

/**
 * The reference-point cluster's read layer.
 *
 * `referencePoint` always exists — the combined root owns the key with the domain's slice. The
 * EXTENDED reference point deliberately does NOT: the readers distinguish "absent" from "empty", so
 * it reads as `undefined` until a pluggable visualization reports one (the store holds `null` at
 * rest; this boundary converts — see extended_reference_point_state.ts), and every reader must
 * tolerate that.
 */

export const getReferencePoint = (state: IAppState): IReferencePointState => state.data.referencePoint;

export const getExtendedReferencePoint = (state: IAppState): IExtendedReferencePointState | undefined =>
    state.data.extendedReferencePoint ?? undefined;

/** `referencePoint.buckets` holds the live buckets BY REFERENCE. */
export const getReferencePointBuckets = (state: IAppState): IRawBuckets => state.data.referencePoint.buckets;

/** The filters bucket rebuilt from the filter bar on every buckets mutation. */
export const getReferencePointFilters = (state: IAppState): IRefPointFiltersBucket | undefined =>
    state.data.referencePoint.filters;
