// (C) 2019-2022 GoodData Corporation
import bearFactory, {
    FixedLoginAndPasswordAuthProvider,
    ContextDeferredAuthProvider,
} from "@gooddata/sdk-backend-bear";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { DEFAULT_BACKEND_URL } from "./constants.js";

export function hasCredentialsSetup(): boolean {
    return !!(process.env.GDC_USERNAME && process.env.GDC_PASSWORD);
}

export function needsAuthentication(): boolean {
    return !!process.env.BACKEND_URL && process.env.BACKEND_URL !== DEFAULT_BACKEND_URL;
}

function getBackend(): IAnalyticalBackend {
    const newBackend = bearFactory();

    if (hasCredentialsSetup() && needsAuthentication()) {
        return newBackend.withAuthentication(
            new FixedLoginAndPasswordAuthProvider(process.env.GDC_USERNAME!, process.env.GDC_PASSWORD!),
        );
    }

    return newBackend.withAuthentication(new ContextDeferredAuthProvider());
}

export const backend = getBackend();
