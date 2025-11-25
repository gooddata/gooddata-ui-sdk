// (C) 2007-2025 GoodData Corporation

import { ReactNode, useMemo } from "react";

import { IntlProvider } from "react-intl";

import { resolveLocaleDefaultMessages } from "./intlUtils.js";
import { DefaultLocale } from "./Locale.js";
import { messagesMap } from "./messagesMap.js";

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
export function IntlWrapper({ locale = DefaultLocale, children }: IIntlWrapperProps) {
    const messages = useMemo(() => resolveLocaleDefaultMessages(locale, messagesMap), [locale]);

    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    );
}
