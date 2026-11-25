// (C) 2026 GoodData Corporation

import { isNotSupported } from "@gooddata/sdk-backend-spi";

/**
 * Converts list items one by one and leaves out, with a warning, every item whose content is not
 * supported, so one such item does not fail the whole list. Other errors are rethrown.
 */
export function convertSkippingNotSupported<T extends { id: string }, R>(
    items: T[],
    convert: (item: T) => R,
    label: string,
): R[] {
    return items.flatMap((item) => {
        try {
            return [convert(item)];
        } catch (error) {
            if (isNotSupported(error)) {
                console.warn(`${label} cannot be loaded, skipping it:`, item.id, error);
                return [];
            }
            throw error;
        }
    });
}
