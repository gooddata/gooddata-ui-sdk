// (C) 2007-2025 GoodData Corporation

import { type ReactNode } from "react";

import { type CustomFormats, IntlProvider } from "react-intl";

import { DefaultLocale, resolveLocale, useResolveMessages } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES, resolveMessages } from "../../internal/utils/translations.js";

const formats: CustomFormats = {
    time: {
        hhmm: {
            hour: "numeric",
            minute: "numeric",
        },
    },
    date: {
        shortWithoutYear: {
            day: "numeric",
            month: "short",
        },
        shortWithYear: {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    },
};

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
        <IntlProvider locale={locale} messages={messages[locale]} formats={formats}>
            {children}
        </IntlProvider>
    );
}
