// (C) 2026 GoodData Corporation

import { INITIAL_MODEL } from "../../models/bucket_item.js";
import { type IRawBuckets } from "../../typings/buckets.js";

/**
 * The slice owns the write path for the buckets subtree; the value-level transformers live in
 * buckets_write_helpers.ts.
 *
 * This constant and the pristine seed are the SAME `INITIAL_MODEL` value, shared by identity, which
 * `reducers/test/root_contract.test.ts` pins.
 */
export type IBucketsState = IRawBuckets;

export const bucketsInitialState: IBucketsState = INITIAL_MODEL;
