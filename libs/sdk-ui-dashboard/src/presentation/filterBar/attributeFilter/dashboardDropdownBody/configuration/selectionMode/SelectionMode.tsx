// (C) 2023-2025 GoodData Corporation

import { type DashboardAttributeFilterSelectionMode } from "@gooddata/sdk-model";
import { Dropdown, DropdownList, type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { SelectionModeButton } from "./SelectionModeButton.js";
import { SelectionModeItem } from "./SelectionModeItem.js";
import { ConfigurationCategory } from "../ConfigurationCategory.js";

const ITEM_HEIGHT = 23;
const DROPDOWN_WIDTH = 225;
const ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "bl tl",
        offset: { x: 0, y: 1 },
    },
    {
        align: "tl bl",
        offset: { x: 0, y: -1 },
    },
];

interface ISelectionModeProps {
    selectionTitleText: string;
    multiSelectionOptionText: string;
    singleSelectionOptionText: string;
    singleSelectionDisabledTooltip: string;
    selectionMode: DashboardAttributeFilterSelectionMode;
    onSelectionModeChange: (value: DashboardAttributeFilterSelectionMode) => void;
    disabled: boolean;
}

export function SelectionMode({
    selectionTitleText,
    multiSelectionOptionText,
    singleSelectionOptionText,
    singleSelectionDisabledTooltip,
    selectionMode,
    onSelectionModeChange,
    disabled,
}: ISelectionModeProps) {
    const selectionOptionTitleMap = {
        multi: multiSelectionOptionText,
        single: singleSelectionOptionText,
    };
    const items: DashboardAttributeFilterSelectionMode[] = ["multi", "single"];

    return (
        <>
            <ConfigurationCategory categoryTitle={selectionTitleText} />
            <div className="configuration-selection-mode">
                <Dropdown
                    alignPoints={ALIGN_POINTS}
                    renderButton={({ isOpen, toggleDropdown }) => (
                        <SelectionModeButton
                            isOpen={isOpen}
                            title={selectionOptionTitleMap[selectionMode]}
                            toggleDropdown={toggleDropdown}
                        />
                    )}
                    renderBody={({ closeDropdown }) => (
                        <DropdownList
                            className="attribute-display-form-dropdown-body s-selection-mode-dropdown-body"
                            items={items}
                            itemHeight={ITEM_HEIGHT}
                            width={DROPDOWN_WIDTH}
                            renderItem={({ item }) => (
                                <SelectionModeItem
                                    item={item}
                                    itemTitle={selectionOptionTitleMap[item]}
                                    selected={item === selectionMode}
                                    disabled={item === "single" && disabled}
                                    disabledTooltip={singleSelectionDisabledTooltip}
                                    onClick={() => {
                                        closeDropdown();
                                        onSelectionModeChange(item);
                                    }}
                                />
                            )}
                        />
                    )}
                />
            </div>
        </>
    );
}
