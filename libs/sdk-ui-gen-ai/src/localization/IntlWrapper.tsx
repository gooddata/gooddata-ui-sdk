// (C) 2024-2025 GoodData Corporation

import { ReactNode, useMemo } from "react";

import { IntlProvider } from "react-intl";

import { DefaultLocale, resolveLocaleDefaultMessages } from "@gooddata/sdk-ui";

import { translations } from "./translations.js";

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
    const messages = useMemo(() => resolveLocaleDefaultMessages(locale, translations), [locale]);
    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    );
}
