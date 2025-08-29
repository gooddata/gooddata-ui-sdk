// (C) 2019-2025 GoodData Corporation
import React, { memo, useCallback, useState } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";
import { v4 as uuidv4 } from "uuid";

import {
    IColor,
    IColorPalette,
    IColorPaletteItem,
    IRgbColorValue,
    isColorFromPalette,
    isRgbColor,
} from "@gooddata/sdk-model";
import { ColorPicker } from "@gooddata/sdk-ui-kit";
import { ChartFill } from "@gooddata/sdk-ui-vis-commons";

import ColorOverlay, { DropdownVersionType } from "./ColorOverlay.js";
import ColorPalette from "./ColorPalette.js";
import CustomColorButton from "./CustomColorButton.js";

export enum IconPosition {
    Down,
    Right,
}

export interface ISelectableChild {
    isSelected?: boolean;
    position?: IconPosition;
    disabled?: boolean;
}

export interface IColorDropdownOwnProps {
    selectedColorItem?: IColor;
    colorPalette: IColorPalette;
    showCustomPicker: boolean;
    onColorSelected: (color: IColor) => void;
    disabled?: boolean;
    children?: React.ReactNode;
    chartFill?: ChartFill;
    patternFillIndex?: number;
}

export interface IColorDropdownState {
    isDropdownOpen: boolean;
    dropdownVersion: DropdownVersionType;
}

export type IColorDropdownProps = IColorDropdownOwnProps & WrappedComponentProps;

const COLOR_FOR_UNKNOWN_ITEM: IRgbColorValue = {
    r: 255,
    g: 0,
    b: 0,
};

const ColorDropdown = memo(function ColorDropdown({
    selectedColorItem,
    colorPalette,
    showCustomPicker,
    onColorSelected: onColorSelectedProp,
    disabled,
    children,
    chartFill,
    patternFillIndex,
}: IColorDropdownProps) {
    const [id] = useState(() => uuidv4());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownVersion, setDropdownVersion] = useState(DropdownVersionType.ColorPalette);

    const getClassName = useCallback((): string => {
        return `s-color-drop-down-button-${id}`;
    }, [id]);

    const getIconPosition = useCallback((): IconPosition => {
        return dropdownVersion === DropdownVersionType.ColorPalette ? IconPosition.Down : IconPosition.Right;
    }, [dropdownVersion]);

    const isColorPaletteContent = useCallback(() => {
        return dropdownVersion === DropdownVersionType.ColorPalette;
    }, [dropdownVersion]);

    const getSelectedGuidFromColorItem = useCallback((): string => {
        if (isColorFromPalette(selectedColorItem)) {
            return selectedColorItem.value;
        }

        return null;
    }, [selectedColorItem]);

    const getSelectedColorFromPalette = useCallback((): IRgbColorValue => {
        if (isColorFromPalette(selectedColorItem)) {
            const selected = colorPalette.find((item: IColorPaletteItem) => {
                return item.guid === selectedColorItem.value;
            });

            if (selected) {
                return selected.fill;
            }
        }

        if (isRgbColor(selectedColorItem)) {
            return selectedColorItem.value;
        }

        return COLOR_FOR_UNKNOWN_ITEM;
    }, [selectedColorItem, colorPalette]);

    const onClose = useCallback(() => {
        setIsDropdownOpen(false);
        setDropdownVersion(DropdownVersionType.ColorPalette);
    }, []);

    const onColorSelected = useCallback(
        (color: IColor) => {
            setIsDropdownOpen(false);
            setDropdownVersion(DropdownVersionType.ColorPalette);

            setTimeout(() => {
                onColorSelectedProp(color);
            }, 100);
        },
        [onColorSelectedProp],
    );

    const onColorPickerSubmit = useCallback(
        (color: IRgbColorValue) => {
            const item: IColor = {
                type: "rgb",
                value: color,
            };

            onColorSelected(item);
        },
        [onColorSelected],
    );

    const onColorPickerCancel = useCallback(() => {
        setDropdownVersion(DropdownVersionType.ColorPalette);
    }, []);

    const onCustomColorButtonClick = useCallback(() => {
        setDropdownVersion(DropdownVersionType.ColorPicker);
    }, []);

    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(!isDropdownOpen);
        setDropdownVersion(DropdownVersionType.ColorPalette);
    }, [isDropdownOpen]);

    const onDropdownButtonClick = useCallback(() => {
        if (!disabled) {
            toggleDropdown();
        }
    }, [disabled, toggleDropdown]);

    const setupDropdownChild = useCallback(() => {
        const childProps: ISelectableChild = {
            isSelected: isDropdownOpen,
            position: getIconPosition(),
            disabled,
        };
        return React.cloneElement(children as React.ReactElement<ISelectableChild>, childProps);
    }, [isDropdownOpen, getIconPosition, disabled, children]);

    const renderColorPaletteContent = useCallback(() => {
        return (
            <div className="gd-color-drop-down">
                <ColorPalette
                    selectedColorGuid={getSelectedGuidFromColorItem()}
                    colorPalette={colorPalette}
                    onColorSelected={onColorSelected}
                    chartFill={chartFill}
                    patternFillIndex={patternFillIndex}
                />
                {showCustomPicker ? <CustomColorButton onClick={onCustomColorButtonClick} /> : null}
            </div>
        );
    }, [
        getSelectedGuidFromColorItem,
        colorPalette,
        showCustomPicker,
        onColorSelected,
        onCustomColorButtonClick,
        chartFill,
        patternFillIndex,
    ]);

    const renderColorPickerContent = useCallback(() => {
        return (
            <ColorPicker
                initialRgbColor={getSelectedColorFromPalette()}
                onSubmit={onColorPickerSubmit}
                onCancel={onColorPickerCancel}
            />
        );
    }, [getSelectedColorFromPalette, onColorPickerSubmit, onColorPickerCancel]);

    return (
        <React.Fragment>
            <div className={getClassName()} onClick={onDropdownButtonClick}>
                {setupDropdownChild()}
            </div>
            {isDropdownOpen ? (
                <ColorOverlay
                    alignTo={`.${getClassName()}`}
                    onClose={onClose}
                    dropdownVersion={dropdownVersion}
                    key={dropdownVersion}
                >
                    <div className="overlay dropdown-body">
                        {isColorPaletteContent() ? renderColorPaletteContent() : renderColorPickerContent()}
                    </div>
                </ColorOverlay>
            ) : null}
        </React.Fragment>
    );
});

export default injectIntl<"intl", IColorDropdownProps>(ColorDropdown);
