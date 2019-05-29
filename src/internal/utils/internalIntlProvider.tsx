// (C) 2019 GoodData Corporation
import * as React from "react";
import { IntlProvider, InjectedIntl } from "react-intl";
import { translations } from "@gooddata/js-utils";
import { ILocale } from "../interfaces/Visualization";
import { DEFAULT_LOCALE } from "../../constants/localization";

import * as enUS from "../translations/en-US.json";
import * as deDE from "../translations/de-DE.json";
import * as esES from "../translations/es-ES.json";
import * as frFR from "../translations/fr-FR.json";
import * as jaJP from "../translations/ja-JP.json";
import * as nlNL from "../translations/nl-NL.json";
import * as ptBR from "../translations/pt-BR.json";
import * as ptPT from "../translations/pt-PT.json";
import * as zhHans from "../translations/zh-Hans.json";

export const messagesMap = {
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

export function createInternalIntl(locale: ILocale = DEFAULT_LOCALE): InjectedIntl {
    const intlProvider = new IntlProvider({ locale, messages: messagesMap[locale] }, {});
    return intlProvider.getChildContext().intl;
}

export interface IInternalIntlWrapperProps {
    locale?: string;
}

export class InternalIntlWrapper extends React.PureComponent<IInternalIntlWrapperProps> {
    public static defaultProps: IInternalIntlWrapperProps = {
        locale: DEFAULT_LOCALE,
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
