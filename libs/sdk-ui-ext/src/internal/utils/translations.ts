// (C) 2019-2025 GoodData Corporation
import { IntlShape } from "react-intl";
import merge from "lodash/merge.js";
import { translationUtils } from "@gooddata/util";
import { messagesMap as sdkUiTranslations } from "@gooddata/sdk-ui";

import { en_US } from "../translations/en-US.localization-bundle.js";
import { de_DE } from "../translations/de-DE.localization-bundle.js";
import { es_ES } from "../translations/es-ES.localization-bundle.js";
import { fr_FR } from "../translations/fr-FR.localization-bundle.js";
import { ja_JP } from "../translations/ja-JP.localization-bundle.js";
import { nl_NL } from "../translations/nl-NL.localization-bundle.js";
import { pt_BR } from "../translations/pt-BR.localization-bundle.js";
import { pt_PT } from "../translations/pt-PT.localization-bundle.js";
import { zh_Hans } from "../translations/zh-Hans.localization-bundle.js";
import { ru_RU } from "../translations/ru-RU.localization-bundle.js";
import { it_IT } from "../translations/it-IT.localization-bundle.js";
import { es_419 } from "../translations/es-419.localization-bundle.js";
import { fr_CA } from "../translations/fr-CA.localization-bundle.js";
import { en_GB } from "../translations/en-GB.localization-bundle.js";
import { en_AU } from "../translations/en-AU.localization-bundle.js";
import { fi_FI } from "../translations/fi-FI.localization-bundle.js";
import { zh_Hant } from "../translations/zh-Hant.localization-bundle.js";
import { zh_HK } from "../translations/zh-HK.localization-bundle.js";

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
    "en-US": translationUtils.removeMetadata(en_US),
    "de-DE": de_DE,
    "es-ES": es_ES,
    "fr-FR": fr_FR,
    "ja-JP": ja_JP,
    "nl-NL": nl_NL,
    "pt-BR": pt_BR,
    "pt-PT": pt_PT,
    "zh-Hans": zh_Hans,
    "ru-RU": ru_RU,
    "it-IT": it_IT,
    "es-419": es_419,
    "fr-CA": fr_CA,
    "en-GB": en_GB,
    "en-AU": en_AU,
    "fi-FI": fi_FI,
    "zh-Hant": zh_Hant,
    "zh-HK": zh_HK,
};

/**
 * @internal
 */
export const translations: { [locale: string]: Record<string, string> } = merge(
    sdkUiTranslations, // we use also some of the sdk-ui strings here so we need to merge them in here
    sdkUiExtTranslations,
);
