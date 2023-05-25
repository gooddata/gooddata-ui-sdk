// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { SingleSelectListItem } from "../../../../List/index.js";
import { Dropdown, DropdownButton, DropdownList } from "../../../../Dropdown/index.js";
import { NumericInput } from "./NumericInput.js";
import { DEFAULT_UNIT, UNITS, UnitsType } from "../types.js";
import { getDefaultHeightForEmbedCodeByUnit } from "../../utils.js";

/**
 * @internal
 */
export interface IHeightSettingProps {
    value?: string;
    unit?: UnitsType;
    onValueChange: (value: string, unit: UnitsType) => void;
}

/**
 * @internal
 */
export const HeightSetting: React.VFC<IHeightSettingProps> = (props) => {
    const { value, onValueChange, unit = DEFAULT_UNIT } = props;

    const onChange = useCallback(
        (val: string) => {
            if (val !== value) {
                onValueChange(val, unit);
            }
        },
        [value, unit, onValueChange],
    );

    const onUnitChange = useCallback(
        (unit: UnitsType) => {
            onValueChange(getDefaultHeightForEmbedCodeByUnit(unit), unit);
        },
        [onValueChange],
    );

    return (
        <div className="height-setting-component">
            <NumericInput
                value={value ?? getDefaultHeightForEmbedCodeByUnit(unit)}
                onValueChanged={onChange}
            />
            <UnitSelect selectedUnit={unit} onSelectUnit={onUnitChange} />
        </div>
    );
};

interface IDropdownItem {
    id: UnitsType;
    title: string;
}

interface UnitSelectProps {
    selectedUnit: UnitsType;
    onSelectUnit: (unit: UnitsType) => void;
}

const items: IDropdownItem[] = UNITS.map((u) => ({ id: u, title: u }));

const UnitSelect: React.VFC<UnitSelectProps> = (props) => {
    const { selectedUnit, onSelectUnit } = props;

    return (
        <Dropdown
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    items={items}
                    width={60}
                    renderItem={({ item }) => {
                        return (
                            <SingleSelectListItem
                                title={item.title}
                                isSelected={item.id === selectedUnit}
                                onClick={() => {
                                    onSelectUnit(item.id);
                                    closeDropdown();
                                }}
                            />
                        );
                    }}
                />
            )}
            renderButton={({ openDropdown, isOpen }) => (
                <DropdownButton value={selectedUnit} isOpen={isOpen} onClick={openDropdown} />
            )}
        />
    );
};
