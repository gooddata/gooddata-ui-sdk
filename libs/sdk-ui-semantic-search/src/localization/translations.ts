// (C) 2024 GoodData Corporation
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
import itIT from "./bundles/it-IT.json";
import es419 from "./bundles/es-419.json";
import frCA from "./bundles/fr-CA.json";
import enGB from "./bundles/en-GB.json";
import enAU from "./bundles/en-AU.json";
import fiFI from "./bundles/fi-FI.json";
import zhHant from "./bundles/zh-Hant.json";
import zhHK from "./bundles/zh-HK.json";

export const translations: { [locale: string]: Record<string, string> } = {
    "de-DE": deDE,
    "en-AU": enAU,
    "en-GB": enGB,
    "en-US": translationUtils.removeMetadata(enUS),
    "es-419": es419,
    "es-ES": esES,
    "fi-FI": fiFI,
    "fr-CA": frCA,
    "fr-FR": frFR,
    "it-IT": itIT,
    "ja-JP": jaJP,
    "nl-NL": nlNL,
    "pt-BR": ptBR,
    "pt-PT": ptPT,
    "ru-RU": ruRU,
    "zh-Hans": zhHans,
    "zh-Hant": zhHant,
    "zh-HK": zhHK,
};
