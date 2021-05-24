// (C) 2019-2021 GoodData Corporation
import bearFactory, { ContextDeferredAuthProvider } from "@gooddata/sdk-backend-bear";

export const backend = bearFactory().withAuthentication(new ContextDeferredAuthProvider());
