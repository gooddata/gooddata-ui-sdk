// (C) 2025 GoodData Corporation

import { useRef } from "react";

import { useIntl } from "react-intl";

import UiAsyncTableDropdownItem from "./UiAsyncTableDropdownItem.js";
import { Dropdown } from "../../../Dropdown/Dropdown.js";
import { DropdownList } from "../../../Dropdown/DropdownList.js";
import { UiButton } from "../../UiButton/UiButton.js";
import { UiAutofocus } from "../../UiFocusManager/UiAutofocus.js";
import { e } from "../asyncTableBem.js";
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
                        isDisabled={!bulkActions.length}
                        label={intl.formatMessage(messages["chooseAction"])}
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
                                    onClick={() => {
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
