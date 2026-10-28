// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type ILocale } from "@gooddata/sdk-model";
import { BackendProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider, UiToastProvider, UiToastsContainer } from "@gooddata/sdk-ui-kit";

import { HostIntlProvider } from "./HostIntlProvider.js";

/**
 * @internal
 */
export interface IHostChromeProvidersProps {
    locale: ILocale;
    additionalMessages?: Record<string, string>;
    backend: IAnalyticalBackend;
    children: ReactNode;
}

/**
 * @internal
 */
export function HostChromeProviders({
    locale,
    additionalMessages,
    backend,
    children,
}: IHostChromeProvidersProps) {
    return (
        <HostIntlProvider locale={locale} additionalMessages={additionalMessages}>
            <BackendProvider backend={backend}>
                <ToastsCenterContextProvider>
                    <UiToastProvider>
                        {children}
                        <UiToastsContainer />
                    </UiToastProvider>
                </ToastsCenterContextProvider>
            </BackendProvider>
        </HostIntlProvider>
    );
}
