// (C) 2007-2019 GoodData Corporation
import React from "react";
import { IntlProvider } from "react-intl";
import { translations } from "@gooddata/js-utils";
import { DefaultLocale } from "./Locale";

import * as enUS from "./bundles/en-US.json";
import * as deDE from "./bundles/de-DE.json";
import * as esES from "./bundles/es-ES.json";
import * as frFR from "./bundles/fr-FR.json";
import * as jaJP from "./bundles/ja-JP.json";
import * as nlNL from "./bundles/nl-NL.json";
import * as ptBR from "./bundles/pt-BR.json";
import * as ptPT from "./bundles/pt-PT.json";
import * as zhHans from "./bundles/zh-Hans.json";

interface ITranslations {
    [key: string]: string;
}

export const messagesMap: { [locale: string]: ITranslations } = {
    "en-US": translations.removeMetadata(enUS),
    "de-DE": deDE,
    "es-ES": esES,
    "fr-FR": frFR,
    "ja-JP": jaJP,
    "nl-NL": nlNL,
    "pt-BR": ptBR,
    "pt-PT": ptPT,
    "zh-Hans": zhHans,
};

export interface IIntlWrapperProps {
    locale: string;
}

export class IntlWrapper extends React.PureComponent<IIntlWrapperProps> {
    public static defaultProps: IIntlWrapperProps = {
        locale: DefaultLocale,
    };
    public render() {
        const { locale } = this.props;
        return (
            <IntlProvider locale={locale} messages={messagesMap[locale]}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
