// (C) 2019-2021 GoodData Corporation
import { SingleSelectListItemType } from "@gooddata/sdk-ui-kit";

import translations from "../translations/en-US.json";

export interface IDropdownItem {
    title?: string;
    value?: string | number | boolean;
    type?: SingleSelectListItemType;
    icon?: string;
    info?: string;
}

type TranslationKeys = keyof typeof translations;

/**
 * This type narrows down the title to be a key from the translations bundle. Otherwise it provides
 * same properties as the normal dropdown.
 */
export interface ITranslatedDropdownItem extends IDropdownItem {
    title?: TranslationKeys;
}
