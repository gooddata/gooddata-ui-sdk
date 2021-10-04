// (C) 2021 GoodData Corporation

import { IBackendCapabilities } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export interface BackendCapabilitiesState {
    backendCapabilities?: IBackendCapabilities;
}

export const backendCapabilitiesInitialState: BackendCapabilitiesState = { backendCapabilities: undefined };
