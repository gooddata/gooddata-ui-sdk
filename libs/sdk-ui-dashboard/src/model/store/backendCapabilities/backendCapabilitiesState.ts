// (C) 2021-2026 GoodData Corporation

import { type IBackendCapabilities } from "@gooddata/sdk-backend-spi";

/**
 * @public
 */
export type BackendCapabilitiesState = {
    backendCapabilities?: IBackendCapabilities;
};

export const backendCapabilitiesInitialState: BackendCapabilitiesState = { backendCapabilities: undefined };
