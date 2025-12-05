// (C) 2024-2025 GoodData Corporation

import { ReactNode } from "react";

import { IntlProvider } from "react-intl";

import { DefaultLocale, resolveLocale, useResolveMessages } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES, resolveMessages } from "./translations.js";

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale?: string;
    children?: ReactNode;
}

/**
 * @internal
 */
export function IntlWrapper({ children, locale = DefaultLocale }: IIntlWrapperProps) {
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
