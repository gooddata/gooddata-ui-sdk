// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { IntlProvider, addLocaleData } from "react-intl";
import { translations } from "@gooddata/js-utils";
import { DEFAULT_LOCALE } from "../../../constants/localization";

import * as deLocaleData from "react-intl/locale-data/de";
import * as esLocaleData from "react-intl/locale-data/es";
import * as enLocaleData from "react-intl/locale-data/en";
import * as frLocaleData from "react-intl/locale-data/fr";
import * as jaLocaleData from "react-intl/locale-data/ja";
import * as nlLocaleData from "react-intl/locale-data/nl";
import * as ptLocaleData from "react-intl/locale-data/pt";
import * as zhLocaleData from "react-intl/locale-data/zh";

addLocaleData([
    ...deLocaleData,
    ...esLocaleData,
    ...enLocaleData,
    ...frLocaleData,
    ...jaLocaleData,
    ...nlLocaleData,
    ...ptLocaleData,
    ...zhLocaleData,
]);

import * as enUS from "../../../translations/en-US.json";
import * as deDE from "../../../translations/de-DE.json";
import * as esES from "../../../translations/es-ES.json";
import * as frFR from "../../../translations/fr-FR.json";
import * as jaJP from "../../../translations/ja-JP.json";
import * as nlNL from "../../../translations/nl-NL.json";
import * as ptBR from "../../../translations/pt-BR.json";
import * as ptPT from "../../../translations/pt-PT.json";
import * as zhHans from "../../../translations/zh-Hans.json";

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

export interface IIntlWrapperProps {
    locale: string;
}

export class IntlWrapper extends React.PureComponent<IIntlWrapperProps> {
    public static defaultProps: IIntlWrapperProps = {
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
