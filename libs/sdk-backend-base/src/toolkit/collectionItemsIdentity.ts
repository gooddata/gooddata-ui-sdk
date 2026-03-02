// (C) 2019-2026 GoodData Corporation

import SparkMD5 from "spark-md5";

import { type ICollectionItemsConfig } from "@gooddata/sdk-backend-spi";

/**
 * Canonical collection items config used to compute request identity.
 *
 * @internal
 */
export type NormalizedCollectionItemsIdentityConfig = Pick<
    ICollectionItemsConfig,
    "collectionId" | "kind" | "values" | "limit" | "bbox"
>;

function normalizeCollectionValues(values: string[] | undefined): string[] {
    if (!values || values.length === 0) {
        return [];
    }

    const uniqueValues = Array.from(new Set(values.filter((value) => value.length > 0)));
    // Fixed locale ensures deterministic order across environments (recorder vs replay).
    return uniqueValues.sort((a, b) => a.localeCompare(b, "en"));
}

function hashCollectionItemsIdentity(value: string): string {
    // Keep keys filesystem-friendly for mock recordings while avoiding 32-bit collisions.
    return SparkMD5.hash(value);
}

/**
 * Normalizes collection items request to canonical identity form.
 *
 * @remarks
 * This normalization is intentionally deterministic only (dedupe/sort/filter-empty),
 * not semantic. It must preserve backend request semantics exactly, so different values
 * (for example `CA` vs `US-CA`) stay different identities.
 *
 * Recorder and replay must both use this function. If its behavior changes, recordings
 * must be regenerated because identity keys will change.
 *
 * @internal
 */
export function normalizeCollectionItemsIdentityConfig(
    config: ICollectionItemsConfig,
): NormalizedCollectionItemsIdentityConfig {
    const values = normalizeCollectionValues(config.values);

    return {
        collectionId: config.collectionId,
        ...(config.kind === undefined ? {} : { kind: config.kind }),
        ...(values.length > 0 ? { values } : {}),
        ...(typeof config.limit === "number" ? { limit: config.limit } : {}),
        ...(config.bbox ? { bbox: config.bbox } : {}),
    };
}

/**
 * Computes canonical lookup key for collection items request identity.
 *
 * @remarks
 * The key is derived from normalized request identity, not raw object shape.
 * Keep recorder and replay on this shared helper to avoid key drift.
 *
 * @internal
 */
export function collectionItemsIdentityKey(config: ICollectionItemsConfig): string {
    const normalizedConfig = normalizeCollectionItemsIdentityConfig(config);
    return hashCollectionItemsIdentity(JSON.stringify(normalizedConfig));
}
