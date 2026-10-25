// (C) 2007-2026 GoodData Corporation

import {
    getExtendedReferencePointBuckets,
    getUiConfigCustomError,
} from "../store/reference_point/extended_reference_point_selectors.js";
import {
    type IExtendedRefPointBuckets,
    type IExtendedRefPointCustomError,
} from "../store/reference_point/extended_reference_point_state.js";
import { type IAppState } from "../store/types.js";

export function getUiConfigCustomErrorSelector(state: IAppState): IExtendedRefPointCustomError | null {
    // the null-for-absent contract is what this selector is for
    return getUiConfigCustomError(state) ?? null;
}

/** `undefined` until a plug viz answers — see getExtendedReferencePointBuckets for why it matters. */
export function getBucketsExtended(state: IAppState): IExtendedRefPointBuckets | undefined {
    return getExtendedReferencePointBuckets(state);
}
