// (C) 2007-2021 GoodData Corporation
import React, { useMemo } from "react";
import { IntlProvider } from "react-intl";
import { translationUtils } from "@gooddata/util";
import { DefaultLocale } from "./Locale";
import { pickCorrectInsightWording } from "./TranslationsCustomizationProvider/utils";

import enUS from "./bundles/en-US.json";
import deDE from "./bundles/de-DE.json";
import esES from "./bundles/es-ES.json";
import frFR from "./bundles/fr-FR.json";
import jaJP from "./bundles/ja-JP.json";
import nlNL from "./bundles/nl-NL.json";
import ptBR from "./bundles/pt-BR.json";
import ptPT from "./bundles/pt-PT.json";
import zhHans from "./bundles/zh-Hans.json";
import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface ITranslations {
    [key: string]: string;
}

/**
 * @internal
 */
export const messagesMap: { [locale: string]: ITranslations } = {
    "en-US": translationUtils.removeMetadata(enUS),
    "de-DE": deDE,
    "es-ES": esES,
    "fr-FR": frFR,
    "ja-JP": jaJP,
    "nl-NL": nlNL,
    "pt-BR": ptBR,
    "pt-PT": ptPT,
    "zh-Hans": zhHans,
};

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale?: string;
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
        () => pickCorrectInsightWording(messagesMap[locale], settings),
        [locale, settings, messagesMap],
    );

    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    );
};
