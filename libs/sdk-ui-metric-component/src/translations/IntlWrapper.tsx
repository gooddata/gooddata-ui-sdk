// (C) 2007-2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { IntlProvider } from "react-intl";

import { resolveLocale, useResolveMessages } from "@gooddata/sdk-ui";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES, resolveMessages } from "./translations.js";

export interface ITranslations {
    [key: string]: string;
}

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale?: string;
}

/**
 * @internal
 */
export function IntlWrapper({ locale = DEFAULT_LANGUAGE, children }: PropsWithChildren<IIntlWrapperProps>) {
    const messages = useResolveMessages(resolveLocale(locale), resolveMessages, DEFAULT_MESSAGES);
    if (!messages[locale]) {
        return null;
    }

    return (
        <IntlProvider locale={locale} messages={messages[locale]}>
            {children}
        </IntlProvider>
    );
}
