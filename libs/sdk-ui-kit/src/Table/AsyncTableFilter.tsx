// (C) 2025 GoodData Corporation
import React, { useCallback, useMemo, useRef } from "react";
import { e } from "./asyncTableBem.js";
import { Dropdown } from "../Dropdown/Dropdown.js";
import { UiButton } from "../@ui/UiButton/UiButton.js";
import { UiAutofocus } from "../@ui/UiFocusManager/UiAutofocus.js";
import { DropdownList } from "../Dropdown/DropdownList.js";
import AsyncTableDropdownItem from "./AsyncTableDropdownItem.js";
import { useIntl } from "react-intl";
import { messages } from "./locales.js";
import { IAsyncTableFilterOption, IAsyncTableFilterProps } from "./types.js";
import { useDebouncedState } from "../utils/debounce.js";

/**
 * @internal
 */
export function AsyncTableFilter({
    label,
    options,
    selected,
    onItemClick,
    scrollToStart,
}: IAsyncTableFilterProps) {
    const intl = useIntl();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [searchValue, setSearchValue, debouncedSearchValue] = useDebouncedState("", 300);

    const filteredOptions = useMemo(() => {
        const searchLowerCased = debouncedSearchValue.toLowerCase();
        return options.filter((option) => option.label.toLowerCase().includes(searchLowerCased));
    }, [options, debouncedSearchValue]);

    const onSelect = useCallback(
        (item: IAsyncTableFilterOption, closeDropdown: () => void) => {
            scrollToStart();
            onItemClick(item);
            closeDropdown();
        },
        [scrollToStart, onItemClick],
    );

    return (
        <div className={e("filter")}>
            <Dropdown
                renderButton={({ toggleDropdown }) => (
                    <UiButton
                        ref={buttonRef}
                        label={selected ? selected : label}
                        onClick={() => toggleDropdown()}
                        size="small"
                        iconAfter="navigateDown"
                    />
                )}
                alignPoints={[{ align: "bl tl" }]}
                renderBody={({ closeDropdown }) => (
                    <UiAutofocus>
                        <DropdownList<IAsyncTableFilterOption>
                            items={filteredOptions}
                            renderItem={({ item }) => (
                                <AsyncTableDropdownItem
                                    label={item.label ?? String(item.value)}
                                    onSelect={() => onSelect(item, closeDropdown)}
                                    isSelected={item.value === selected}
                                />
                            )}
                            showSearch={true}
                            searchPlaceholder={intl.formatMessage(messages.filterSearchPlaceholder)}
                            searchString={searchValue}
                            onSearch={setSearchValue}
                            title={label}
                            renderVirtualisedList
                            onKeyDownSelect={(item) => onSelect(item, closeDropdown)}
                        ></DropdownList>
                    </UiAutofocus>
                )}
            />
        </div>
    );
}
