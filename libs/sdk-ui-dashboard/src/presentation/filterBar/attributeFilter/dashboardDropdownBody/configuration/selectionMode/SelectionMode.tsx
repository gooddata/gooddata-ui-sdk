// (C) 2023 GoodData Corporation
import React from "react";
import { ConfigurationCategory } from "../ConfigurationCategory.js";
import { DashboardAttributeFilterSelectionMode } from "@gooddata/sdk-model";
import { Dropdown, DropdownList, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { SelectionModeItem } from "./SelectionModeItem.js";
import { SelectionModeButton } from "./SelectionModeButton.js";

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

export const SelectionMode: React.FC<ISelectionModeProps> = (props) => {
    const {
        selectionTitleText,
        multiSelectionOptionText,
        singleSelectionOptionText,
        singleSelectionDisabledTooltip,
        selectionMode,
        onSelectionModeChange,
        disabled,
    } = props;

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
};
