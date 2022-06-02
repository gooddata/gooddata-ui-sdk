// (C) 2019-2022 GoodData Corporation
import tigerFactory, {
    TigerTokenAuthProvider,
    ContextDeferredAuthProvider,
} from "@gooddata/sdk-backend-tiger";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

export function hasCredentialsSetup(): boolean {
    return !!process.env.TIGER_API_TOKEN;
}

export function needsAuthentication(): boolean {
    return true;
}

function getBackend(): IAnalyticalBackend {
    const newBackend = tigerFactory();

    if (hasCredentialsSetup()) {
        return newBackend.withAuthentication(new TigerTokenAuthProvider(process.env.TIGER_API_TOKEN!));
    }

    return newBackend.withAuthentication(new ContextDeferredAuthProvider());
}

export const backend = getBackend();
