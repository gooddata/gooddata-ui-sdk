// (C) 2025 GoodData Corporation

import { type PropsWithChildren } from "react";

import { IntlProvider } from "react-intl";

import { useResolveMessages } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES, resolveMessages } from "./translations.js";

/**
 * `IntlProvider` wrapper for use in tests.
 * @internal
 */
export function TestIntlProvider({ children }: PropsWithChildren) {
    const locale = "en-US";
    const messages = useResolveMessages(locale, resolveMessages, DEFAULT_MESSAGES);

    return (
        <IntlProvider locale={locale} messages={messages[locale]}>
            {children}
        </IntlProvider>
    );
}
