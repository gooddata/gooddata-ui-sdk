// (C) 2025 GoodData Corporation

import { useRef } from "react";

import { useIntl } from "react-intl";

import { UiAsyncTableDropdownItem } from "./UiAsyncTableDropdownItem.js";
import { Dropdown } from "../../../Dropdown/Dropdown.js";
import { DropdownList } from "../../../Dropdown/DropdownList.js";
import { UiButton } from "../../UiButton/UiButton.js";
import { UiAutofocus } from "../../UiFocusManager/UiAutofocus.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { UiAsyncTableBulkActionsProps } from "../types.js";
import { ASYNC_TABLE_BULK_ACTIONS_BUTTON_ID, ASYNC_TABLE_BULK_ACTIONS_MENU_ID } from "./constants.js";

export function UiAsyncTableBulkActions({ bulkActions }: UiAsyncTableBulkActionsProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const intl = useIntl();

    return (
        <div className={e("bulk-actions")}>
            <Dropdown
                renderButton={({ toggleDropdown, isOpen }) => (
                    <UiButton
                        id={ASYNC_TABLE_BULK_ACTIONS_BUTTON_ID}
                        ref={buttonRef}
                        isDisabled={!bulkActions.length}
                        label={intl.formatMessage(messages["chooseAction"])}
                        onClick={() => toggleDropdown()}
                        size="small"
                        iconAfter="navigateDown"
                        accessibilityConfig={{
                            ariaExpanded: isOpen,
                            ariaHaspopup: true,
                            ariaControls: ASYNC_TABLE_BULK_ACTIONS_MENU_ID,
                            iconAriaHidden: true,
                        }}
                    />
                )}
                alignPoints={[{ align: "bl tl" }]}
                renderBody={({ closeDropdown }) => (
                    <UiAutofocus>
                        <DropdownList
                            id={ASYNC_TABLE_BULK_ACTIONS_MENU_ID}
                            items={bulkActions}
                            renderItem={({ item }) => (
                                <UiAsyncTableDropdownItem
                                    label={item.label}
                                    onClick={() => {
                                        item.onClick();
                                        closeDropdown();
                                    }}
                                    accessibilityConfig={item.accessibilityConfig}
                                />
                            )}
                            width={200}
                            renderVirtualisedList
                            accessibilityConfig={{
                                role: "menu",
                                ariaLabelledBy: ASYNC_TABLE_BULK_ACTIONS_BUTTON_ID,
                            }}
                        />
                    </UiAutofocus>
                )}
            />
        </div>
    );
}
