// (C) 2007-2024 GoodData Corporation
import { translationUtils } from "@gooddata/util";

import enUS from "./bundles/en-US.json" with { type: "json" };
import deDE from "./bundles/de-DE.json" with { type: "json" };
import esES from "./bundles/es-ES.json" with { type: "json" };
import frFR from "./bundles/fr-FR.json" with { type: "json" };
import jaJP from "./bundles/ja-JP.json" with { type: "json" };
import nlNL from "./bundles/nl-NL.json" with { type: "json" };
import ptBR from "./bundles/pt-BR.json" with { type: "json" };
import ptPT from "./bundles/pt-PT.json" with { type: "json" };
import zhHans from "./bundles/zh-Hans.json" with { type: "json" };
import ruRU from "./bundles/ru-RU.json" with { type: "json" };
import itIT from "./bundles/it-IT.json" with { type: "json" };
import es419 from "./bundles/es-419.json" with { type: "json" };
import frCA from "./bundles/fr-CA.json" with { type: "json" };
import enGB from "./bundles/en-GB.json" with { type: "json" };
import enAU from "./bundles/en-AU.json" with { type: "json" };
import fiFI from "./bundles/fi-FI.json" with { type: "json" };
import zhHant from "./bundles/zh-Hant.json" with { type: "json" };
import zhHK from "./bundles/zh-HK.json" with { type: "json" };

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
    "it-IT": itIT,
    "es-419": es419,
    "fr-CA": frCA,
    "en-GB": enGB,
    "en-AU": enAU,
    "fi-FI": fiFI,
    "zh-Hant": zhHant,
    "zh-HK": zhHK,
};
