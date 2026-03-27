// (C) 2026 GoodData Corporation

import { useRef } from "react";

import { type DashboardAttributeFilterSelectionType } from "@gooddata/sdk-model";
import { Dropdown, DropdownList, type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { SelectionTypeButton } from "./SelectionTypeButton.js";
import { SelectionTypeItem } from "./SelectionTypeItem.js";

const ITEM_HEIGHT = 28;
const ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "br tr",
        offset: { x: 0, y: 1 },
    },
    {
        align: "tr br",
        offset: { x: 0, y: -1 },
    },
];

interface ISelectionTypeProps {
    asLabelText: string;
    listOrTextOptionText: string;
    listOrTextTooltip: string;
    listOptionText: string;
    listTooltip: string;
    textOptionText: string;
    textTooltip: string;
    selectionType: DashboardAttributeFilterSelectionType;
    onSelectionTypeChange: (value: DashboardAttributeFilterSelectionType) => void;
    isSingleSelectionMode?: boolean;
    singleSelectionDisabledTooltip?: string;
}

export function SelectionType({
    asLabelText,
    listOrTextOptionText,
    listOrTextTooltip,
    listOptionText,
    listTooltip,
    textOptionText,
    textTooltip,
    selectionType,
    onSelectionTypeChange,
    isSingleSelectionMode,
    singleSelectionDisabledTooltip,
}: ISelectionTypeProps) {
    const buttonRef = useRef<HTMLElement>(null);
    const optionTitleMap: Record<DashboardAttributeFilterSelectionType, string> = {
        listOrText: listOrTextOptionText,
        list: listOptionText,
        text: textOptionText,
    };
    const optionTooltipMap: Record<DashboardAttributeFilterSelectionType, string> = {
        listOrText: listOrTextTooltip,
        list: listTooltip,
        text: textTooltip,
    };
    const items: DashboardAttributeFilterSelectionType[] = ["listOrText", "list", "text"];

    const getDropdownWidth = () => {
        return buttonRef.current?.offsetWidth;
    };

    return (
        <div className="configuration-selection-kind">
            <span className="configuration-selection-kind-label">{asLabelText}</span>
            <Dropdown
                className="selection-kind-dropdown"
                alignPoints={ALIGN_POINTS}
                renderButton={({ isOpen, toggleDropdown }) => (
                    <SelectionTypeButton
                        ref={buttonRef}
                        isOpen={isOpen}
                        title={optionTitleMap[selectionType]}
                        toggleDropdown={toggleDropdown}
                    />
                )}
                renderBody={({ closeDropdown }) => (
                    <DropdownList
                        className="attribute-display-form-dropdown-body s-selection-kind-dropdown-body"
                        items={items}
                        itemHeight={ITEM_HEIGHT}
                        width={getDropdownWidth()}
                        renderItem={({ item }) => (
                            <SelectionTypeItem
                                item={item}
                                itemTitle={optionTitleMap[item]}
                                tooltip={optionTooltipMap[item]}
                                selected={item === selectionType}
                                disabled={isSingleSelectionMode ? item !== "list" : undefined}
                                disabledTooltip={singleSelectionDisabledTooltip}
                                onClick={() => {
                                    closeDropdown();
                                    onSelectionTypeChange(item);
                                }}
                            />
                        )}
                    />
                )}
            />
        </div>
    );
}
