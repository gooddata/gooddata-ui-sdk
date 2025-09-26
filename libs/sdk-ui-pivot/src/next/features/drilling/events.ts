// (C) 2025 GoodData Corporation

import { IDrillEvent } from "@gooddata/sdk-ui";

/**
 * Creates a custom drill event for embedded scenarios
 *
 * @param drillEvent - The drill event to create
 * @returns The custom drill event
 */
export const createCustomDrillEvent = (drillEvent: IDrillEvent) => {
    return new CustomEvent("drill", {
        detail: drillEvent,
        bubbles: true,
    });
};
