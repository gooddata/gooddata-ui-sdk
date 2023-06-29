// (C) 2023 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { ILocale, LOCALES } from "@gooddata/sdk-ui";

import { DEFAULT_LOCALE } from "../types.js";
import { Dropdown, DropdownButton, DropdownList } from "../../../../Dropdown/index.js";
import { SingleSelectListItem } from "../../../../List/index.js";
import { dialogChangeMessageLabels } from "../../../../locales.js";

import { ToggleSwitch } from "./ToggleSwitch.js";

/**
 * @internal
 */
export interface ILocaleSettingProps {
    isChecked: boolean;
    selectedLocal: ILocale;
    onChecked: () => void;
    onLocaleSelected: (locale: ILocale) => void;
}

/**
 * @internal
 */
export const LocaleSetting: React.VFC<ILocaleSettingProps> = (props) => {
    const intl = useIntl();
    const { isChecked, selectedLocal, onChecked, onLocaleSelected } = props;

    return (
        <>
            <ToggleSwitch
                id={"locale"}
                className="bottom-space"
                label={intl.formatMessage({
                    id: "embedInsightDialog.webComponents.options.locale",
                })}
                checked={isChecked}
                onChange={onChecked}
                questionMarkMessage={intl.formatMessage(dialogChangeMessageLabels.locale)}
            />

            {isChecked ? (
                <LocaleSelect
                    selectedLocale={selectedLocal || DEFAULT_LOCALE}
                    onSelectLocale={onLocaleSelected}
                />
            ) : null}
        </>
    );
};

interface LocaleSelectProps {
    selectedLocale: ILocale;
    onSelectLocale: (locale: ILocale) => void;
}

interface ILocaleDropdownItem {
    id: ILocale;
    title: string;
}

const localeItems: ILocaleDropdownItem[] = LOCALES.map((u) => ({ id: u as ILocale, title: u }));

const LocaleSelect: React.FC<LocaleSelectProps> = (props) => {
    const { selectedLocale, onSelectLocale } = props;

    const renderDropdownBody = useCallback(
        ({ closeDropdown }: { closeDropdown: () => void }) => {
            return (
                <DropdownList
                    items={localeItems}
                    width={60}
                    renderItem={({ item }) => {
                        return (
                            <SingleSelectListItem
                                title={item.title}
                                isSelected={item.id === selectedLocale}
                                onClick={() => {
                                    onSelectLocale(item.id);
                                    closeDropdown();
                                }}
                            />
                        );
                    }}
                />
            );
        },
        [onSelectLocale, selectedLocale],
    );

    const renderDropdownButton = useCallback(
        ({ openDropdown, isOpen }: { openDropdown: () => void; isOpen: boolean }): React.ReactNode => {
            return <DropdownButton value={selectedLocale} isOpen={isOpen} onClick={openDropdown} />;
        },
        [selectedLocale],
    );

    return (
        <div className="locale-setting-component bottom-space">
            <Dropdown renderBody={renderDropdownBody} renderButton={renderDropdownButton} />
        </div>
    );
};
