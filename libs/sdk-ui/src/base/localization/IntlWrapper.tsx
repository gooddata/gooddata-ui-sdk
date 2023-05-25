// (C) 2007-2022 GoodData Corporation
import React, { useMemo } from "react";
import { IntlProvider } from "react-intl";
import { DefaultLocale } from "./Locale.js";
import { pickCorrectWording } from "./TranslationsCustomizationProvider/utils.js";

import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { messagesMap } from "./messagesMap.js";

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

    const messages = useMemo(() => pickCorrectWording(messagesMap[locale], settings), [locale, settings]);

    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    );
};
