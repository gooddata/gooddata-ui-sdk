// (C) 2021 GoodData Corporation

import bearFactory from "@gooddata/sdk-backend-bear";

import { BearTokenAuthProvider } from "./BearTokenAuthProvider";

export function getBackend(token: string) {
    const authProvider = new BearTokenAuthProvider(token);

    return bearFactory().withAuthentication(authProvider);
}
