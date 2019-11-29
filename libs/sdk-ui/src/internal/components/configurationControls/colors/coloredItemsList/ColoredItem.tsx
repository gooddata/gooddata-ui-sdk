// (C) 2019 GoodData Corporation
import * as React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { IColor, IColorPalette } from "@gooddata/sdk-model";
import ColoredItemContent from "./ColoredItemContent";
import ColorDropdown from "../colorDropdown/ColorDropdown";
import { IColoredItem, IColoredItemDropdownItem } from "../../../../interfaces/Colors";
import { isMeasureDescriptor, isResultAttributeHeader } from "@gooddata/sdk-backend-spi";
import { IMappingHeader } from "../../../../../base/interfaces/MappingHeader";

export interface IColoredItemProps {
    colorPalette: IColorPalette;
    className?: string;
    item?: IColoredItemDropdownItem;
    onSelect?: (source: IColoredItem, color: IColor) => void;
    showCustomPicker?: boolean;
    isSelected?: boolean;
    disabled?: boolean;
}

class ColoredItem extends React.PureComponent<IColoredItemProps & WrappedComponentProps> {
    public static defaultProps = {
        showCustomPicker: false,
        disabled: false,
    };

    public render() {
        const coloredItem: IColoredItem = this.props.item ? this.props.item.source : null;

        if (!coloredItem) {
            return this.renderLoadingItem();
        }

        const headerItem: IMappingHeader = coloredItem.mappingHeader;
        const text = this.getText(headerItem);

        return (
            <ColorDropdown
                selectedColorItem={coloredItem.colorItem}
                colorPalette={this.props.colorPalette}
                onColorSelected={this.onColorSelected}
                showCustomPicker={this.props.showCustomPicker}
            >
                <ColoredItemContent text={text} color={coloredItem.color} />
            </ColorDropdown>
        );
    }

    private renderLoadingItem() {
        return <div className="gd-list-item gd-list-item-not-loaded" />;
    }

    private onColorSelected = (color: IColor) => {
        const { item, onSelect } = this.props;
        if (onSelect) {
            onSelect(item.source, color);
        }
    };

    private getText(headerItem: IMappingHeader) {
        let text;

        if (isMeasureDescriptor(headerItem)) {
            text = headerItem.measureHeaderItem.name;
        } else if (isResultAttributeHeader(headerItem)) {
            text = headerItem.attributeHeaderItem.name;
        }

        return text;
    }
}

export default injectIntl(ColoredItem);
