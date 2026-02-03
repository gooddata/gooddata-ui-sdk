// (C) 2025-2026 GoodData Corporation

import { setContext } from "../esm/index.js";
import tigerFactory, { TigerTokenAuthProvider } from "../esm/tigerBackend.js";

// Get environment variables (these are defined by Vite at build time)
// eslint-disable-next-line no-undef
const backendUrl = VITE_BACKEND_URL;
// eslint-disable-next-line no-undef
const authToken = VITE_AUTH_TOKEN;
// eslint-disable-next-line no-undef
const workspaceId = VITE_WORKSPACE;

setContext({
    backend: tigerFactory().onHostname(backendUrl).withAuthentication(new TigerTokenAuthProvider(authToken)),
    workspaceId: workspaceId,
});
