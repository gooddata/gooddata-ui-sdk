// (C) 2019 GoodData Corporation
import { InjectedIntl, MessageValue } from "react-intl";
import { IDropdownItem } from "../components/configurationControls/DropdownControl";

export function getTranslation(
    translationId: string,
    intl: InjectedIntl,
    values: { [key: string]: MessageValue } = {},
) {
    return intl ? intl.formatMessage({ id: translationId }, values) : translationId;
}

export function getTranslatedDropdownItems(
    dropdownItems: IDropdownItem[],
    intl: InjectedIntl,
): IDropdownItem[] {
    return dropdownItems.map((item: IDropdownItem) => {
        const translatedTitleProp = item.title ? { title: getTranslation(item.title, intl) } : {};
        return { ...item, ...translatedTitleProp };
    });
}
