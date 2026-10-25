// (C) 2007-2026 GoodData Corporation

// https://github.com/yahoo/react-intl/issues/243#issuecomment-165924794
import { type ReactNode } from "react";

import { IntlProvider } from "react-intl";
import { useSelector } from "react-redux";

import { getIntlMessages, getLocale } from "../selectors/intl_selector.js";
import { type IAppState } from "../store/types.js";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "./translations.js";

const formats = {
    time: {
        hhmm: {
            hour: "numeric",
            minute: "2-digit",
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
} as const;

interface IModifiedMessagesWrapper {
    children: ReactNode;
}

export function TranslationsWrapper({ children }: IModifiedMessagesWrapper) {
    const locale = useSelector((state: IAppState) => getLocale(state)) ?? DEFAULT_LANGUAGE;
    const messagesMap = useSelector((state: IAppState) => getIntlMessages(state));

    const messages = messagesMap[locale] ?? DEFAULT_MESSAGES[DEFAULT_LANGUAGE];
    return (
        <IntlProvider key={locale} locale={locale} messages={messages} formats={formats}>
            {children}
        </IntlProvider>
    );
}
