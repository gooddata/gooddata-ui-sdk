// (C) 2026 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import { IntlProvider } from "react-intl";

import { type ILocale } from "@gooddata/sdk-model";
import { DEFAULT_LANGUAGE, resolveLocale, useResolveMessages } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES, resolveMessages } from "../components/lib/translations.js";

interface IHostIntlProviderProps {
    locale: ILocale;
    additionalMessages?: Record<string, string>;
    children: ReactNode;
}

export function HostIntlProvider({ locale, additionalMessages, children }: IHostIntlProviderProps) {
    const resolvedLocale = resolveLocale(locale);
    const baseMessages = useResolveMessages(resolvedLocale, resolveMessages, DEFAULT_MESSAGES);
    const base = baseMessages[resolvedLocale] ?? DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    const allMessages = useMemo(
        () => (additionalMessages ? { ...base, ...additionalMessages } : base),
        [base, additionalMessages],
    );

    return (
        <IntlProvider locale={resolvedLocale} messages={allMessages}>
            {children}
        </IntlProvider>
    );
}
