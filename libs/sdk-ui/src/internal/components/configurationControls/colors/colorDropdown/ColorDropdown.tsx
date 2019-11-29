// (C) 2019 GoodData Corporation
import * as React from "react";
import ColorPicker from "@gooddata/goodstrap/lib/ColorPicker/ColorPicker";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { IRgbColorValue, IColor, isColorFromPalette, isRgbColor, IColorPalette } from "@gooddata/sdk-model";
import * as uuid from "uuid";
import ColorOverlay, { DropdownVersionType } from "./ColorOverlay";
import ColorPalette from "./ColorPalette";
import CustomColorButton from "./CustomColorButton";

export enum IconPosition {
    Down,
    Right,
}

export interface ISelectableChild {
    isSelected?: boolean;
    position?: IconPosition;
}

export interface IColorDropdownProps {
    selectedColorItem?: IColor;
    colorPalette: IColorPalette;
    showCustomPicker: boolean;
    onColorSelected: (color: IColor) => void;
}

export interface IColorDropdownState {
    isDropdownOpen: boolean;
    dropdownVersion: DropdownVersionType;
}

const COLOR_FOR_UNKNOWN_ITEM: IRgbColorValue = {
    r: 255,
    g: 0,
    b: 0,
};

class ColorDropdown extends React.PureComponent<
    IColorDropdownProps & WrappedComponentProps,
    IColorDropdownState
> {
    private id: string;

    constructor(props: IColorDropdownProps & WrappedComponentProps) {
        super(props);
        this.id = uuid.v4();
        this.state = {
            isDropdownOpen: false,
            dropdownVersion: DropdownVersionType.ColorPalette,
        };
    }

    public render() {
        return (
            <React.Fragment>
                <div className={this.getClassName()} onClick={this.onDropdownButtonClick}>
                    {this.setupDropdownChild()}
                </div>
                {this.state.isDropdownOpen && (
                    <ColorOverlay
                        alignTo={`.${this.getClassName()}`}
                        onClose={this.onClose}
                        dropdownVersion={this.state.dropdownVersion}
                        key={this.state.dropdownVersion}
                    >
                        <div className="overlay dropdown-body">
                            {this.isColorPaletteContent()
                                ? this.renderColorPaletteContent()
                                : this.renderColorPickerContent()}
                        </div>
                    </ColorOverlay>
                )}
            </React.Fragment>
        );
    }

    private setupDropdownChild() {
        const childProps: ISelectableChild = {
            isSelected: this.state.isDropdownOpen,
            position: this.getIconPosition(),
        };
        return React.cloneElement(this.props.children as React.ReactElement<ISelectableChild>, childProps);
    }

    private getIconPosition(): IconPosition {
        return this.state.dropdownVersion === DropdownVersionType.ColorPalette
            ? IconPosition.Down
            : IconPosition.Right;
    }

    private isColorPaletteContent() {
        return this.state.dropdownVersion === DropdownVersionType.ColorPalette;
    }

    private renderColorPaletteContent() {
        return (
            <div className="gd-color-drop-down">
                <ColorPalette
                    selectedColorGuid={this.getSelectedGuidFromColorItem()}
                    colorPalette={this.props.colorPalette}
                    onColorSelected={this.onColorSelected}
                />
                {this.props.showCustomPicker && <CustomColorButton onClick={this.onCustomColorButtonClick} />}
            </div>
        );
    }

    private getSelectedGuidFromColorItem(): string {
        if (isColorFromPalette(this.props.selectedColorItem)) {
            return this.props.selectedColorItem.value;
        }

        return null;
    }

    private renderColorPickerContent() {
        return (
            <ColorPicker
                initialRgbColor={this.getSelectedColorFromPalette()}
                onSubmit={this.onColorPickerSubmit}
                onCancel={this.onColorPickerCancel}
                intl={this.props.intl}
            />
        );
    }

    private getSelectedColorFromPalette(): IRgbColorValue {
        if (isColorFromPalette(this.props.selectedColorItem)) {
            const selected = this.props.colorPalette.find((item: any) => {
                return item.guid === this.props.selectedColorItem.value;
            });

            if (selected) {
                return selected.fill;
            }
        }

        if (isRgbColor(this.props.selectedColorItem)) {
            return this.props.selectedColorItem.value;
        }

        return COLOR_FOR_UNKNOWN_ITEM;
    }

    private onColorPickerSubmit = (color: IRgbColorValue) => {
        const item: IColor = {
            type: "rgb",
            value: color,
        };

        this.onColorSelected(item);
    };

    private onColorPickerCancel = () => {
        this.setState({ dropdownVersion: DropdownVersionType.ColorPalette });
    };

    private onCustomColorButtonClick = () => {
        this.setState({ dropdownVersion: DropdownVersionType.ColorPicker });
    };

    private getClassName(): string {
        return `s-color-drop-down-button-${this.id}`;
    }

    private onClose = () => {
        this.setState({ isDropdownOpen: false, dropdownVersion: DropdownVersionType.ColorPalette });
    };

    private onDropdownButtonClick = () => {
        this.toggleDropdown();
    };

    private onColorSelected = (color: IColor) => {
        this.setState({
            isDropdownOpen: false,
            dropdownVersion: DropdownVersionType.ColorPalette,
        });

        setTimeout(() => {
            this.props.onColorSelected(color);
        }, 100);
    };

    private toggleDropdown() {
        this.setState({
            isDropdownOpen: !this.state.isDropdownOpen,
            dropdownVersion: DropdownVersionType.ColorPalette,
        });
    }
}

export default injectIntl(ColorDropdown);
