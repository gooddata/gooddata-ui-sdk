// (C) 2022 GoodData Corporation
import React, { useCallback, useEffect, useState } from "react";
import { SingleSelectListItem } from "../../../../List";
import { Dropdown, DropdownButton, DropdownList } from "../../../../Dropdown";

type UnitsType = "px";

const UNITS: UnitsType[] = ["px"];

const DEFAULT_HEIGHT = 400;

/**
 * @internal
 */
export interface IHeightSettingProps {
    value: number;
    onValueChange: (value: number) => void;
}

const isNumeric = (num: any) =>
    (typeof num === "number" || (typeof num === "string" && num.trim() !== "")) && !isNaN(num as number);

/**
 * @internal
 */
export const HeightSetting: React.VFC<IHeightSettingProps> = (props) => {
    const { value, onValueChange } = props;

    const [inputValue, setInputValue] = useState<number | string>(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    const onBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement, Element>) => {
            const val = e.target.value;
            const replaceDecimal = val.replace(",", ".");

            if (isNumeric(replaceDecimal)) {
                onValueChange(Number(replaceDecimal));
            } else {
                setInputValue(DEFAULT_HEIGHT);
                onValueChange(DEFAULT_HEIGHT);
            }
        },
        [onValueChange],
    );

    return (
        <div className="height-setting-component">
            <input
                className="gd-input-field"
                maxLength={4}
                onChange={onChange}
                onBlur={onBlur}
                value={inputValue}
                onKeyPress={(e) => !/^[0-9]*[.,]?[0-9]*$/.test(e.key) && e.preventDefault()}
            />
            <UnitSelector selectedUnit={"px"} />
        </div>
    );
};

/**
 * @internal
 */
export interface IDropdownItem {
    id: string;
    title: string;
}

interface UnitSelectorProps {
    selectedUnit: UnitsType;
}

/**
 * @internal
 */
const UnitSelector: React.VFC<UnitSelectorProps> = (props) => {
    const { selectedUnit } = props;
    const items = UNITS.map((u) => ({ id: u, title: u }));

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
                                    //  onSelect(item);
                                    closeDropdown();
                                }}
                            />
                        );
                    }}
                />
            )}
            renderButton={({ openDropdown, isOpen }) => (
                <DropdownButton value="px" isOpen={isOpen} onClick={openDropdown} />
            )}
        />
    );
};
