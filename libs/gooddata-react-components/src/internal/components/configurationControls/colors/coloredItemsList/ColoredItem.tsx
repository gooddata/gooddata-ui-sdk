// (C) 2019 GoodData Corporation
import * as React from "react";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { IColorItem } from "@gooddata/gooddata-js";
import ColoredItemContent from "./ColoredItemContent";
import ColorDropdown from "../colorDropdown/ColorDropdown";
import { IColoredItem, IColoredItemDropdownItem } from "../../../../interfaces/Colors";
import * as ChartConfiguration from "../../../../../interfaces/Config";
import * as MappingHeader from "../../../../../interfaces/MappingHeader";

export interface IColoredItemProps {
    colorPalette: ChartConfiguration.IColorPalette;
    className?: string;
    item?: IColoredItemDropdownItem;
    onSelect?: (source: IColoredItem, color: IColorItem) => void;
    showCustomPicker?: boolean;
    isSelected?: boolean;
    disabled?: boolean;
}

class ColoredItem extends React.PureComponent<IColoredItemProps & InjectedIntlProps> {
    public static defaultProps = {
        showCustomPicker: false,
        disabled: false,
    };

    public render() {
        const coloredItem: IColoredItem = this.props.item ? this.props.item.source : null;

        if (!coloredItem) {
            return this.renderLoadingItem();
        }

        const headerItem: MappingHeader.IMappingHeader = coloredItem.mappingHeader;
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

    private onColorSelected = (color: IColorItem) => {
        const { item, onSelect } = this.props;
        if (onSelect) {
            onSelect(item.source, color);
        }
    };

    private getText(headerItem: MappingHeader.IMappingHeader) {
        let text;

        if (MappingHeader.isMappingHeaderMeasureItem(headerItem)) {
            text = headerItem.measureHeaderItem.name;
        } else if (MappingHeader.isMappingHeaderAttributeItem(headerItem)) {
            text = headerItem.attributeHeaderItem.name;
        }

        return text;
    }
}

export default injectIntl(ColoredItem);
