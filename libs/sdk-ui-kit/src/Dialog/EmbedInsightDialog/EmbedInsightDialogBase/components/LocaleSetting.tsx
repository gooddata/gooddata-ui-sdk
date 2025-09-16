// (C) 2023-2025 GoodData Corporation

import { ReactNode, useCallback } from "react";

import { useIntl } from "react-intl";

import { ILocale, LOCALES } from "@gooddata/sdk-ui";

import { ToggleSwitch } from "./ToggleSwitch.js";
import { Dropdown, DropdownButton, DropdownList } from "../../../../Dropdown/index.js";
import { SingleSelectListItem } from "../../../../List/index.js";
import { dialogChangeMessageLabels } from "../../../../locales.js";
import { DEFAULT_LOCALE } from "../types.js";

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
export function LocaleSetting({
    isChecked,
    selectedLocal,
    onChecked,
    onLocaleSelected,
}: ILocaleSettingProps) {
    const intl = useIntl();

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
}

interface LocaleSelectProps {
    selectedLocale: ILocale;
    onSelectLocale: (locale: ILocale) => void;
}

interface ILocaleDropdownItem {
    id: ILocale;
    title: string;
}

const localeItems: ILocaleDropdownItem[] = LOCALES.map((u) => ({ id: u as ILocale, title: u }));

function LocaleSelect(props: LocaleSelectProps) {
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
        ({ openDropdown, isOpen }: { openDropdown: () => void; isOpen: boolean }): ReactNode => {
            return <DropdownButton value={selectedLocale} isOpen={isOpen} onClick={openDropdown} />;
        },
        [selectedLocale],
    );

    return (
        <div className="locale-setting-component bottom-space">
            <Dropdown renderBody={renderDropdownBody} renderButton={renderDropdownButton} />
        </div>
    );
}
