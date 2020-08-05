// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";

import { IntlShape, createIntl } from "react-intl";
import { translationUtils } from "@gooddata/util";

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
