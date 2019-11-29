// (C) 2019 GoodData Corporation
import * as React from "react";
import { IntlProvider, IntlShape, createIntl } from "react-intl";
import { translations } from "@gooddata/js-utils";
import { DEFAULT_LOCALE } from "../../base/constants/localization";

import * as enUS from "../translations/en-US.json";
import * as deDE from "../translations/de-DE.json";
import * as esES from "../translations/es-ES.json";
import * as frFR from "../translations/fr-FR.json";
import * as jaJP from "../translations/ja-JP.json";
import * as nlNL from "../translations/nl-NL.json";
import * as ptBR from "../translations/pt-BR.json";
import * as ptPT from "../translations/pt-PT.json";
import * as zhHans from "../translations/zh-Hans.json";
import { ILocale } from "../../base/interfaces/Locale";

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

export function createInternalIntl(locale: ILocale = DEFAULT_LOCALE): IntlShape {
    return createIntl({ locale, messages: messagesMap[locale] });
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
