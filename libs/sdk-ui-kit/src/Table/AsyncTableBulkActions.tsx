// (C) 2025 GoodData Corporation
import React, { useRef } from "react";
import { e } from "./asyncTableBem.js";
import { Dropdown } from "../Dropdown/Dropdown.js";
import { UiButton } from "../@ui/UiButton/UiButton.js";
import { UiAutofocus } from "../@ui/UiFocusManager/UiAutofocus.js";
import { DropdownList } from "../Dropdown/DropdownList.js";
import AsyncTableDropdownItem from "./AsyncTableDropdownItem.js";
import { useIntl } from "react-intl";
import { messages } from "./locales.js";
import { IAsyncTableBulkActionsProps } from "./types.js";

export function AsyncTableBulkActions({ bulkActions }: IAsyncTableBulkActionsProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const intl = useIntl();

    return (
        <div className={e("bulk-actions")}>
            <Dropdown
                renderButton={({ toggleDropdown }) => (
                    <UiButton
                        variant="primary"
                        ref={buttonRef}
                        label={intl.formatMessage(messages.chooseAction)}
                        onClick={() => toggleDropdown()}
                        size="small"
                        iconAfter="chevronDown"
                    />
                )}
                alignPoints={[{ align: "bl tl" }]}
                renderBody={({ closeDropdown }) => (
                    <UiAutofocus>
                        <DropdownList
                            items={bulkActions}
                            renderItem={({ item }) => (
                                <AsyncTableDropdownItem
                                    label={item.label}
                                    onSelect={() => {
                                        item.onClick();
                                        closeDropdown();
                                    }}
                                />
                            )}
                            width={200}
                            renderVirtualisedList
                        />
                    </UiAutofocus>
                )}
            />
        </div>
    );
}
