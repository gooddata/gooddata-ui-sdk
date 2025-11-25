// (C) 2007-2025 GoodData Corporation

import { ReactNode, useMemo } from "react";

import { CustomFormats, IntlProvider } from "react-intl";

import { DefaultLocale, resolveLocaleDefaultMessages } from "@gooddata/sdk-ui";

import { translations } from "../../internal/utils/translations.js";

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
    const messages = useMemo(() => resolveLocaleDefaultMessages(locale, translations), [locale]);
    return (
        <IntlProvider locale={locale} messages={messages} formats={formats}>
            {children}
        </IntlProvider>
    );
}
