// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { SingleSelectListItem } from "../../../../List";
import { Dropdown, DropdownButton, DropdownList } from "../../../../Dropdown";
import { NumericInput } from "./NumericInput";
import { UnitsType } from "../types";

const UNITS: UnitsType[] = ["px", "%", "rem", "em"];

type UnitMap = {
    [key in UnitsType]: string;
};

const DEFAULT_UNIT: UnitsType = "px";

const DEFAULT_HEIGHT: UnitMap = {
    px: "400",
    "%": "50",
    rem: "25",
    em: "25",
};

const getDefaultValue = (unit: UnitsType): string => {
    return DEFAULT_HEIGHT[unit];
};

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
            if (val != value) {
                onValueChange(val, unit);
            }
        },
        [value, unit, onValueChange],
    );

    const onUnitChange = useCallback(
        (unit: UnitsType) => {
            onValueChange(getDefaultValue(unit), unit);
        },
        [onValueChange],
    );

    return (
        <div className="height-setting-component">
            <NumericInput value={value ?? getDefaultValue(unit)} onValueChanged={onChange} />
            <UnitSelector selectedUnit={unit} onSelectUnit={onUnitChange} />
        </div>
    );
};

interface IDropdownItem {
    id: UnitsType;
    title: string;
}

interface UnitSelectorProps {
    selectedUnit: UnitsType;
    onSelectUnit: (unit: UnitsType) => void;
}

const UnitSelector: React.VFC<UnitSelectorProps> = (props) => {
    const { selectedUnit, onSelectUnit } = props;
    const items: IDropdownItem[] = UNITS.map((u) => ({ id: u, title: u }));

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
