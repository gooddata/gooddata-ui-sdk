// (C) 2019-2023 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { IColor, IColorPalette } from "@gooddata/sdk-model";
import ColoredItemContent from "./ColoredItemContent";
import ColorDropdown from "../colorDropdown/ColorDropdown";
import { IColoredItem } from "../../../../interfaces/Colors";
import { getMappingHeaderFormattedName, IMappingHeader } from "@gooddata/sdk-ui";
import { getTranslation } from "../../../../utils/translations";

export interface IColoredItemProps {
    colorPalette: IColorPalette;
    className?: string;
    item?: IColoredItem;
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
        const { item, intl, colorPalette, showCustomPicker } = this.props;
        const coloredItem: IColoredItem = item ? item : null;

        if (!coloredItem) {
            return this.renderLoadingItem();
        }

        const headerItem: IMappingHeader = coloredItem.mappingHeader;
        const headerText = this.getText(headerItem);
        const emptyText = `(${getTranslation("empty_value", intl)})`;
        const text = headerText === null || headerText === "" ? emptyText : headerText;

        return (
            <ColorDropdown
                selectedColorItem={coloredItem.colorItem}
                colorPalette={colorPalette}
                onColorSelected={this.onColorSelected}
                showCustomPicker={showCustomPicker}
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
            onSelect(item, color);
        }
    };

    private getText(mappingHeader: IMappingHeader) {
        return getMappingHeaderFormattedName(mappingHeader) || "";
    }
}

export default injectIntl(ColoredItem);
