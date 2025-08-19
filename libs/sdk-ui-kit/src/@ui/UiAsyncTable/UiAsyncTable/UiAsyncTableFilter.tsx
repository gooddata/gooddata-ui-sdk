// (C) 2025 GoodData Corporation
import React, { useCallback, useMemo, useRef } from "react";

import { useIntl } from "react-intl";

import { useDebouncedState } from "@gooddata/sdk-ui";

import UiAsyncTableDropdownItem from "./UiAsyncTableDropdownItem.js";
import { Dropdown } from "../../../Dropdown/Dropdown.js";
import { DropdownList } from "../../../Dropdown/DropdownList.js";
import { UiButton } from "../../UiButton/UiButton.js";
import { UiAutofocus } from "../../UiFocusManager/UiAutofocus.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { UiAsyncTableFilterOption, UiAsyncTableFilterProps } from "../types.js";

/**
 * @internal
 */
export function UiAsyncTableFilter({
    label,
    options,
    selected,
    onItemClick,
    isSmall,
}: UiAsyncTableFilterProps) {
    const intl = useIntl();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [searchValue, setSearchValue, debouncedSearchValue] = useDebouncedState("", 300);

    const filteredOptions = useMemo(() => {
        const searchLowerCased = debouncedSearchValue.toLowerCase();
        return options.filter((option) => option.label.toLowerCase().includes(searchLowerCased));
    }, [options, debouncedSearchValue]);

    const onSelect = useCallback(
        (item: UiAsyncTableFilterOption, closeDropdown: () => void) => {
            onItemClick(item);
            closeDropdown();
        },
        [onItemClick],
    );

    return (
        <div className={e("filter")}>
            <Dropdown
                renderButton={({ toggleDropdown }) => (
                    <UiButton
                        ref={buttonRef}
                        label={selected ? selected.label : label}
                        onClick={() => toggleDropdown()}
                        size="small"
                        maxWidth={isSmall ? 20 : 80}
                        iconAfter="navigateDown"
                    />
                )}
                alignPoints={[{ align: "bl tl" }]}
                renderBody={({ closeDropdown }) => (
                    <UiAutofocus>
                        <DropdownList<UiAsyncTableFilterOption>
                            items={filteredOptions}
                            renderItem={({ item }) => (
                                <UiAsyncTableDropdownItem
                                    label={item.label ?? String(item.value)}
                                    secondaryLabel={item.secondaryLabel}
                                    onSelect={() => onSelect(item, closeDropdown)}
                                    isSelected={item.value === selected.value}
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
