// (C) 2022 GoodData Corporation
import { IDashboardLayoutSectionHeader } from "@gooddata/sdk-model";

/**
 * @internal
 */
export function sanitizeHeader<T extends IDashboardLayoutSectionHeader | undefined>(header: T): T {
    // get rid of empty values in header altogether
    return (header && {
        ...(header.description && { description: header.description }),
        ...(header.title && { title: header.title }),
    }) as T;
}
