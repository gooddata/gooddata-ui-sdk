// (C) 2022 GoodData Corporation

// Re-export Tiger backend, so it can be imported by user as a separate entry point
// This helps us with chunking and keeping the original entry point slim
export {
    default as default,
    ContextDeferredAuthProvider,
    redirectToTigerAuthentication,
} from "@gooddata/sdk-backend-tiger";
