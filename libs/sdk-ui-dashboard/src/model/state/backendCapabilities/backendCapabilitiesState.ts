// (C) 2021 GoodData Corporation

import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface BackendCapabilitiesState {
    backendCapabilities?: IBackendCapabilities;
}

export const backendCapabilitiesInitialState: BackendCapabilitiesState = { backendCapabilities: undefined };
