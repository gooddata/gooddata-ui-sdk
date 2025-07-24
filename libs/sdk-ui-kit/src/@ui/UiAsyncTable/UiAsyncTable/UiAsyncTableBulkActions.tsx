// (C) 2025 GoodData Corporation
import React, { useRef } from "react";
import { e } from "../asyncTableBem.js";
import { Dropdown } from "../../../Dropdown/Dropdown.js";
import { UiButton } from "../../UiButton/UiButton.js";
import { UiAutofocus } from "../../UiFocusManager/UiAutofocus.js";
import { DropdownList } from "../../../Dropdown/DropdownList.js";
import UiAsyncTableDropdownItem from "./UiAsyncTableDropdownItem.js";
import { useIntl } from "react-intl";
import { messages } from "../locales.js";
import { UiAsyncTableBulkActionsProps } from "../types.js";

export function UiAsyncTableBulkActions({ bulkActions }: UiAsyncTableBulkActionsProps) {
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
                        iconAfter="navigateDown"
                    />
                )}
                alignPoints={[{ align: "bl tl" }]}
                renderBody={({ closeDropdown }) => (
                    <UiAutofocus>
                        <DropdownList
                            items={bulkActions}
                            renderItem={({ item }) => (
                                <UiAsyncTableDropdownItem
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
