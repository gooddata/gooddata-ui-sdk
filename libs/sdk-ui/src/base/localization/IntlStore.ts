// (C) 2007-2022 GoodData Corporation
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
import ruRU from "./bundles/ru-RU.json";
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
    "ru-RU": ruRU,
};

const intlStore = {};

/**
 * Gets react-intl's IntlShape set up for the provided locale.
 *
 * @param locale - one of the supported locales, if not specified returns shape for `DefaultLocale`
 * @internal
 */
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

/**
 * Convenience function to return translated and formatted string for given key and locale; optionally specify
 * values of parameters to substitute in the translated string.
 *
 * @param translationId - id of the localized string
 * @param locale - target locale
 * @param values - parameters, optional
 *
 * @internal
 */
export function getTranslation(translationId: string | { id: string }, locale: ILocale, values = {}): string {
    const intl = getIntl(locale);
    const desc =
        typeof translationId === "object"
            ? { ...translationId, defaultMessage: translationId.id }
            : { id: translationId, defaultMessage: translationId };
    return intl.formatMessage(desc, values);
}
