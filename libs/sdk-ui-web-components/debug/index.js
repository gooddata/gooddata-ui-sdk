// (C) 2025-2026 GoodData Corporation

import { setContext } from "../esm/index.js";
import tigerFactory, { TigerTokenAuthProvider } from "../esm/tigerBackend.js";

// Get environment variables (these are defined by Vite at build time)
const backendUrl = VITE_BACKEND_URL;
const authToken = VITE_AUTH_TOKEN;
const workspaceId = VITE_WORKSPACE;

setContext({
    backend: tigerFactory().onHostname(backendUrl).withAuthentication(new TigerTokenAuthProvider(authToken)),
    workspaceId: workspaceId,
});
