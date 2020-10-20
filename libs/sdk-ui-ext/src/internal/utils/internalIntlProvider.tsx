// (C) 2019 GoodData Corporation
import React from "react";
import { IntlProvider, IntlShape, createIntl } from "react-intl";
import { translationUtils } from "@gooddata/util";

import enUS from "../translations/en-US.json";
import deDE from "../translations/de-DE.json";
import esES from "../translations/es-ES.json";
import frFR from "../translations/fr-FR.json";
import jaJP from "../translations/ja-JP.json";
import nlNL from "../translations/nl-NL.json";
import ptBR from "../translations/pt-BR.json";
import ptPT from "../translations/pt-PT.json";
import zhHans from "../translations/zh-Hans.json";
import { DefaultLocale, ILocale } from "@gooddata/sdk-ui";

const messagesMap = {
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

export function createInternalIntl(locale: ILocale = DefaultLocale): IntlShape {
    return createIntl({ locale, messages: messagesMap[locale] });
}

interface IInternalIntlWrapperProps {
    locale?: string;
}

export class InternalIntlWrapper extends React.PureComponent<IInternalIntlWrapperProps> {
    public static defaultProps: IInternalIntlWrapperProps = {
        locale: DefaultLocale,
    };
    public render(): React.ReactNode {
        const { locale } = this.props;
        return (
            <IntlProvider locale={locale} messages={messagesMap[locale]}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
