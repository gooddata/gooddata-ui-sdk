// (C) 2022-2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { useSelector } from "react-redux";

import { BackendProvider as SdkBackendProvider } from "@gooddata/sdk-ui";

import { backend } from "./backend.js";
import { selectIsBackendInitialized } from "./store/application_context/app_context_selector.js";

/**
 * The component wraps SDK BackendProvider so we can render children then requires it conditionally until the
 * backend is ready. Backend can be created later when it is created without API token in special embedded
 * mode when it waits for API token injection via postMessage. When the token is received, the new backend
 * instance is created and assigned into the variable exported by the backend module and redux store flag
 * is updated with information that backend is ready.
 */
export function BackendProvider({ children }: PropsWithChildren) {
    const isBackendInitialized = useSelector(selectIsBackendInitialized);

    if (!isBackendInitialized) {
        return null;
    }
    return <SdkBackendProvider backend={backend}>{children}</SdkBackendProvider>;
}
