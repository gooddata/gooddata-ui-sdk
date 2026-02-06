// (C) 2025-2026 GoodData Corporation

import { type IHeaderPredicate } from "@gooddata/sdk-ui";

/**
 * Optional explicit, serializable key for a predicate function.
 *
 * @remarks
 * Some predicates are created from persisted insight configuration (e.g. `IColorMappingItem.id`),
 * where the original "id" string is available and stable. For those, we register the id so the
 * fingerprint does not depend on function identity.
 */
const predicateKeyByFn = new WeakMap<IHeaderPredicate, string>();

/**
 * Fallback identity mapping for predicates that don't have a registered key.
 *
 * @remarks
 * `IHeaderPredicate` is a function type. Functions cannot be reliably serialized (JSON drops them,
 * `fn.toString()`/`fn.name` are unstable across builds/minification). To still produce a stable
 * fingerprint, we assign an incrementing number to each function instance on first use and keep it
 * in this WeakMap.
 *
 * This is safe memory-wise: entries disappear automatically once the predicate function is no longer
 * referenced anywhere else.
 */
const predicateIdByFn = new WeakMap<IHeaderPredicate, number>();
let nextPredicateId = 1;

/**
 * Registers a stable, serializable key for a header predicate function.
 *
 * @remarks
 * Geo layer color mappings use {@link IHeaderPredicate} functions that cannot be reliably stringified.
 * This registry allows us to fingerprint predicates by a stable key (e.g. mapping id) when available.
 *
 * @internal
 */
export function registerHeaderPredicateKey(predicate: IHeaderPredicate, key: string): void {
    predicateKeyByFn.set(predicate, key);
}

/**
 * Returns a stable fingerprint for a header predicate.
 *
 * @remarks
 * - If a predicate key was registered via {@link registerHeaderPredicateKey}, the key is used.
 * - Otherwise, the predicate is fingerprinted by its function identity using an internal WeakMap.
 *
 * This is stable across renders as long as the same predicate function instance is reused.
 *
 * @internal
 */
export function getHeaderPredicateFingerprint(predicate: IHeaderPredicate): string {
    const key = predicateKeyByFn.get(predicate);
    if (key) {
        return `key:${key}`;
    }

    // Fallback: assign a stable id per function *instance*.
    // This function intentionally mutates internal state on the first encounter of a predicate
    // to make subsequent fingerprinting deterministic without relying on function serialization.
    const cachedId = predicateIdByFn.get(predicate);
    if (cachedId) {
        return `fn:${cachedId}`;
    }

    // First time we see this predicate instance -> allocate an id and remember it.
    const id = nextPredicateId++;
    predicateIdByFn.set(predicate, id);
    return `fn:${id}`;
}
