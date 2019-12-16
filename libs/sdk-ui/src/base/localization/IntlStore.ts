// (C) 2007-2019 GoodData Corporation
import isEmpty = require("lodash/isEmpty");

import { InjectedIntl, IntlProvider, addLocaleData } from "react-intl";
import { translations } from "@gooddata/js-utils";

import * as deLocaleData from "react-intl/locale-data/de";
import * as esLocaleData from "react-intl/locale-data/es";
import * as enLocaleData from "react-intl/locale-data/en";
import * as frLocaleData from "react-intl/locale-data/fr";
import * as jaLocaleData from "react-intl/locale-data/ja";
import * as nlLocaleData from "react-intl/locale-data/nl";
import * as ptLocaleData from "react-intl/locale-data/pt";

import * as enUS from "./bundles/en-US.json";
import * as deDE from "./bundles/de-DE.json";
import * as esES from "./bundles/es-ES.json";
import * as frFR from "./bundles/fr-FR.json";
import * as jaJP from "./bundles/ja-JP.json";
import * as nlNL from "./bundles/nl-NL.json";
import * as ptBR from "./bundles/pt-BR.json";
import * as ptPT from "./bundles/pt-PT.json";
import * as zhHans from "./bundles/zh-Hans.json";
import { DefaultLocale, ILocale } from "./Locale";

const messagesMap = {
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

const intlStore = {};

function createIntl(locale: ILocale): InjectedIntl {
    const intlProvider = new IntlProvider({ locale, messages: messagesMap[locale] }, {});
    return intlProvider.getChildContext().intl;
}

export function getIntl(locale: ILocale = DefaultLocale): InjectedIntl {
    let usedLocale = locale;
    if (isEmpty(locale)) {
        usedLocale = DefaultLocale;
    }

    return intlStore[usedLocale] || (intlStore[usedLocale] = createIntl(usedLocale));
}

export function getTranslation(translationId: string, locale: ILocale, values = {}): string {
    const intl = getIntl(locale);
    return intl.formatMessage({ id: translationId, defaultMessage: translationId }, values);
}

export function addLocaleDataToReactIntl() {
    addLocaleData([
        ...deLocaleData,
        ...esLocaleData,
        ...enLocaleData,
        ...frLocaleData,
        ...jaLocaleData,
        ...nlLocaleData,
        ...ptLocaleData,
    ]);
}

export default {
    getIntl,
    getTranslation,
};
