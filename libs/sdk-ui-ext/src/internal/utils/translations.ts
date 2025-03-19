// (C) 2019-2024 GoodData Corporation
import { IntlShape } from "react-intl";
import merge from "lodash/merge.js";
import { translationUtils } from "@gooddata/util";
import { messagesMap as sdkUiTranslations } from "@gooddata/sdk-ui";

import enUS from "../translations/en-US.json" with { type: "json" };
import deDE from "../translations/de-DE.json" with { type: "json" };
import esES from "../translations/es-ES.json" with { type: "json" };
import frFR from "../translations/fr-FR.json" with { type: "json" };
import jaJP from "../translations/ja-JP.json" with { type: "json" };
import nlNL from "../translations/nl-NL.json" with { type: "json" };
import ptBR from "../translations/pt-BR.json" with { type: "json" };
import ptPT from "../translations/pt-PT.json" with { type: "json" };
import zhHans from "../translations/zh-Hans.json" with { type: "json" };
import ruRU from "../translations/ru-RU.json" with { type: "json" };
import itIT from "../translations/it-IT.json" with { type: "json" };
import es419 from "../translations/es-419.json" with { type: "json" };
import frCA from "../translations/fr-CA.json" with { type: "json" };
import enGB from "../translations/en-GB.json" with { type: "json" };
import enAU from "../translations/en-AU.json" with { type: "json" };
import fiFI from "../translations/fi-FI.json" with { type: "json" };
import zhHant from "../translations/zh-Hant.json" with { type: "json" };
import zhHK from "../translations/zh-HK.json" with { type: "json" };

import { IDropdownItem } from "../interfaces/Dropdown.js";

export function getTranslation(
    translationId: string,
    intl: IntlShape,
    values: { [key: string]: string } = {},
): string {
    return intl ? intl.formatMessage({ id: translationId }, values) : translationId;
}

export function getTranslatedDropdownItems(dropdownItems: IDropdownItem[], intl: IntlShape): IDropdownItem[] {
    return dropdownItems.map((item: IDropdownItem) => {
        const translatedTitleProp = item.title ? { title: getTranslation(item.title, intl) } : {};
        const translatedInfoProp = item.info ? { info: getTranslation(item.info, intl) } : {};
        return { ...item, ...translatedTitleProp, ...translatedInfoProp };
    });
}

const sdkUiExtTranslations: { [locale: string]: Record<string, string> } = {
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

/**
 * @internal
 */
export const translations: { [locale: string]: Record<string, string> } = merge(
    sdkUiTranslations, // we use also some of the sdk-ui strings here so we need to merge them in here
    sdkUiExtTranslations,
);
