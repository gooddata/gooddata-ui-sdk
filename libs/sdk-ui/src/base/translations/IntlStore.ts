// (C) 2007-2018 GoodData Corporation
import isEmpty = require("lodash/isEmpty");

import { InjectedIntl, IntlProvider } from "react-intl";
import { translations } from "@gooddata/js-utils";
import { DEFAULT_LOCALE } from "../constants/localization";

import * as enUS from "./bundles/en-US.json";
import * as deDE from "./bundles/de-DE.json";
import * as esES from "./bundles/es-ES.json";
import * as frFR from "./bundles/fr-FR.json";
import * as jaJP from "./bundles/ja-JP.json";
import * as nlNL from "./bundles/nl-NL.json";
import * as ptBR from "./bundles/pt-BR.json";
import * as ptPT from "./bundles/pt-PT.json";
import * as zhHans from "./bundles/zh-Hans.json";
import { ILocale } from "../interfaces/Locale";

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

function getIntl(locale: ILocale = DEFAULT_LOCALE): InjectedIntl {
    let usedLocale = locale;
    if (isEmpty(locale)) {
        usedLocale = DEFAULT_LOCALE;
    }

    return intlStore[usedLocale] || (intlStore[usedLocale] = createIntl(usedLocale));
}

function getTranslation(translationId: string, locale: ILocale, values = {}): string {
    const intl = getIntl(locale);
    return intl.formatMessage({ id: translationId, defaultMessage: translationId }, values);
}

export default {
    getIntl,
    getTranslation,
};
