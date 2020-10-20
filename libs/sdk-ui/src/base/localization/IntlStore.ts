// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";

import { IntlShape, createIntl } from "react-intl";
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
import { DefaultLocale, ILocale } from "./Locale";

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

const intlStore = {};

export function getIntl(locale: ILocale = DefaultLocale): IntlShape {
    let usedLocale = locale;
    if (isEmpty(locale)) {
        usedLocale = DefaultLocale;
    }
    return (
        intlStore[usedLocale] ||
        (intlStore[usedLocale] = createIntl({
            locale: usedLocale,
            messages: messagesMap[locale],
        }))
    );
}

export function getTranslation(translationId: string, locale: ILocale, values = {}): string {
    const intl = getIntl(locale);
    return intl.formatMessage({ id: translationId, defaultMessage: translationId }, values);
}
