// (C) 2007-2025 GoodData Corporation

import { type ReactNode } from "react";

import { IntlProvider } from "react-intl";

import { resolveLocale, useResolveMessages } from "./intlUtils.js";
import { DefaultLocale } from "./Locale.js";
import { DEFAULT_MESSAGES, resolveMessages } from "./messagesMap.js";

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale?: string;
    children?: ReactNode;
    messages?: Record<string, string>;
}

/**
 * @internal
 */
export function IntlWrapper({ locale = DefaultLocale, children }: IIntlWrapperProps) {
    const validatedLocale = resolveLocale(locale);
    const messages = useResolveMessages(validatedLocale, resolveMessages, DEFAULT_MESSAGES);
    if (!messages[validatedLocale]) {
        return null;
    }

    return (
        <IntlProvider locale={validatedLocale} messages={messages[validatedLocale]}>
            {children}
        </IntlProvider>
    );
}
