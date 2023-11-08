// (C) 2007-2022 GoodData Corporation
import { translationUtils } from "@gooddata/util";

import enUS from "./bundles/en-US.js";
import deDE from "./bundles/de-DE.js";
import esES from "./bundles/es-ES.js";
import frFR from "./bundles/fr-FR.js";
import jaJP from "./bundles/ja-JP.js";
import nlNL from "./bundles/nl-NL.js";
import ptBR from "./bundles/pt-BR.js";
import ptPT from "./bundles/pt-PT.js";
import zhHans from "./bundles/zh-Hans.js";
import ruRU from "./bundles/ru-RU.js";

/**
 * @internal
 */
export interface ITranslations {
    [key: string]: string;
}

/**
 * @internal
 */
export const messagesMap: { [locale: string]: ITranslations } = {
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
