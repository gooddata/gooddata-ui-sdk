// (C) 2019-2022 GoodData Corporation
import bearFactory, {
    FixedLoginAndPasswordAuthProvider,
    ContextDeferredAuthProvider,
} from "@gooddata/sdk-backend-bear";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export function hasCredentialsSetup(): boolean {
    return !!(process.env.GDC_USERNAME && process.env.GDC_PASSWORD);
}

function getBackend(): IAnalyticalBackend {
    const newBackend = bearFactory();

    if (hasCredentialsSetup()) {
        return newBackend.withAuthentication(
            new FixedLoginAndPasswordAuthProvider(process.env.GDC_USERNAME!, process.env.GDC_PASSWORD!),
        );
    }

    return newBackend.withAuthentication(new ContextDeferredAuthProvider());
}

export const backend = getBackend();
