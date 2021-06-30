// (C) 2007-2019 GoodData Corporation
import React from "react";
import { IntlProvider } from "react-intl";
import merge from "lodash/merge";
import { DefaultLocale, messagesMap as sdkUiTranslations } from "@gooddata/sdk-ui";
import { translationUtils } from "@gooddata/util";

import enUS from "./bundles/en-US.json";
import deDE from "./bundles/de-DE.json";
import esES from "./bundles/es-ES.json";
import frFR from "./bundles/fr-FR.json";
import jaJP from "./bundles/ja-JP.json";
import nlNL from "./bundles/nl-NL.json";
import ptBR from "./bundles/pt-BR.json";
import ptPT from "./bundles/pt-PT.json";
import zhHans from "./bundles/zh-Hans.json";

const sdkUiDashboardTranslations: { [locale: string]: Record<string, string> } = {
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
export const translations = merge(
    {},
    // we also need the sdk-ui translations
    sdkUiTranslations,
    sdkUiDashboardTranslations,
);

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale: string;
}

/**
 * @internal
 */
export class IntlWrapper extends React.PureComponent<IIntlWrapperProps> {
    public static defaultProps: IIntlWrapperProps = {
        locale: DefaultLocale,
    };

    public render(): React.ReactNode {
        const { locale } = this.props;
        return (
            <IntlProvider locale={locale} messages={translations[locale]}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
