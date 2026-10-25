// (C) 2026 GoodData Corporation

/**
 * `data.bucketsMeta` — the per-cache-item flags the reference point and the filter bar read
 * (`autoCreated` + `modified` decide a filter's `autoCreated` marker) plus the two single-value
 * expansion markers the bucket UI writes.
 *
 * The type lives next to its own slice rather than in a shared state module: one module holding two
 * unrelated domains behind a "cluster" name is a shape this package does not allow.
 *
 * Writers OUTSIDE this domain remain — open-report's restore and the application resets are slice
 * cases, and time travel's undo fixup is infrastructure. They address the whole root and the slice
 * returns unknown-action state unchanged.
 */
export interface IBucketsMetaState {
    autoCreated: Record<string, boolean>;
    modified: Record<string, boolean>;
    collapsed: Record<string, boolean>;
    /** local identifier of the ONE expanded measure / attribute item, or undefined */
    measureExpanded?: string;
    attributeExpanded?: string;
}

/**
 * Frozen for the same reason `models/bucket_item.ts` freezes `INITIAL_MODEL`: the object is shared
 * (one holder initial serves every store instance), so an accidental in-place mutation must throw
 * loudly instead of leaking across mounts.
 */
export const bucketsMetaInitialState: IBucketsMetaState = Object.freeze({
    autoCreated: Object.freeze({}),
    modified: Object.freeze({}),
    collapsed: Object.freeze({}),
}) as IBucketsMetaState;
