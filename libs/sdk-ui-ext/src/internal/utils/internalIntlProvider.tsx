// (C) 2019-2025 GoodData Corporation

import { type ReactNode } from "react";

import { type IntlConfig, IntlProvider, type IntlShape, createIntl } from "react-intl";

import { DefaultLocale, type ILocale, resolveLocale, useResolveMessages } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES, resolveMessages } from "./translations.js";

export function createInternalIntl(
    locale: ILocale = DefaultLocale,
    messages: Record<string, string>,
): IntlShape {
    // Create intl with empty messages - translations should be loaded via InternalIntlWrapper
    const config: IntlConfig = {
        locale,
        messages,
    };
    return createIntl(config);
}

interface IInternalIntlWrapperProps {
    locale?: string;
    children?: ReactNode;
}

export function InternalIntlWrapper({ locale = DefaultLocale, children }: IInternalIntlWrapperProps) {
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
