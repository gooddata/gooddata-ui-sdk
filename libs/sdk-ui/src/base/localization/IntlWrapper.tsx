// (C) 2007-2025 GoodData Corporation
import React, { useMemo } from "react";

import { IntlProvider } from "react-intl";

import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";

import { resolveLocaleDefaultMessages } from "./intlUtils.js";
import { DefaultLocale } from "./Locale.js";
import { messagesMap } from "./messagesMap.js";
import { pickCorrectWording } from "./TranslationsCustomizationProvider/utils.js";

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale?: string;
    children?: React.ReactNode;
}

/**
 * @internal
 */
export const IntlWrapper: React.FC<IIntlWrapperProps> = ({ locale = DefaultLocale, children }) => {
    /**
     * Because of issues described in the ticket FET-855, we decided to use this workaround.
     * After the issues that are described in the ticket are solved or at least reduced,
     * this workaround can be removed.
     */
    const settings = window.gdSettings as IWorkspaceSettings;

    const messages = useMemo(
        () => pickCorrectWording(resolveLocaleDefaultMessages(locale, messagesMap), settings),
        [locale, settings],
    );

    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    );
};
