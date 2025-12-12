// (C) 2021-2023 GoodData Corporation

import { type IBackendCapabilities } from "@gooddata/sdk-backend-spi";

/**
 * @public
 */
export interface BackendCapabilitiesState {
    backendCapabilities?: IBackendCapabilities;
}

export const backendCapabilitiesInitialState: BackendCapabilitiesState = { backendCapabilities: undefined };
