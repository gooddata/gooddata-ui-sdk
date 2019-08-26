// (C) 2007-2018 GoodData Corporation
import { InjectedIntl, IntlProvider } from "react-intl";
import { Localization } from "@gooddata/typings";
import { translations } from "@gooddata/js-utils";
import { DEFAULT_LOCALE } from "../constants/localization";

import * as enUS from "../translations/en-US.json";
import * as deDE from "../translations/de-DE.json";
import * as esES from "../translations/es-ES.json";
import * as frFR from "../translations/fr-FR.json";
import * as jaJP from "../translations/ja-JP.json";
import * as nlNL from "../translations/nl-NL.json";
import * as ptBR from "../translations/pt-BR.json";
import * as ptPT from "../translations/pt-PT.json";
import * as zhHans from "../translations/zh-Hans.json";
import isEmpty = require("lodash/isEmpty");

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

function createIntl(locale: Localization.ILocale): InjectedIntl {
    const intlProvider = new IntlProvider({ locale, messages: messagesMap[locale] }, {});
    return intlProvider.getChildContext().intl;
}

function getIntl(locale: Localization.ILocale = DEFAULT_LOCALE): InjectedIntl {
    let usedLocale = locale;
    if (isEmpty(locale)) {
        usedLocale = DEFAULT_LOCALE;
    }

    return intlStore[usedLocale] || (intlStore[usedLocale] = createIntl(usedLocale));
}

function getTranslation(translationId: string, locale: Localization.ILocale, values = {}): string {
    const intl = getIntl(locale);
    return intl.formatMessage({ id: translationId, defaultMessage: translationId }, values);
}

export default {
    getIntl,
    getTranslation,
};
