// (C) 2019-2021 GoodData Corporation
import { ValueOrUpdateCallback } from "./interfaces";

/**
 * Calls an update callback when it's a function, otherwise returns the value itself.
 * This is just an utility function to DRY the builder implementation a bit.
 *
 * @alpha
 * @param valueOrUpdateCallback - value to set, or update callback
 * @param valueToUpdate - original value to update
 */
export const resolveValueOrUpdateCallback = <TValue>(
    valueOrUpdateCallback: ValueOrUpdateCallback<TValue>,
    valueToUpdate: TValue,
): TValue =>
    // typeof === "function" does not work here
    // Related issue: https://github.com/microsoft/TypeScript/issues/37663
    valueOrUpdateCallback instanceof Function ? valueOrUpdateCallback(valueToUpdate) : valueOrUpdateCallback;
