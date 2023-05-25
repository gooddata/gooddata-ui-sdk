// (C) 2019-2023 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { IColor, IColorPalette } from "@gooddata/sdk-model";
import ColoredItemContent from "./ColoredItemContent.js";
import ColorDropdown from "../colorDropdown/ColorDropdown.js";
import { IColoredItem } from "../../../../interfaces/Colors.js";
import { getMappingHeaderFormattedName, IMappingHeader } from "@gooddata/sdk-ui";
import { getTranslation } from "../../../../utils/translations.js";
import { isWaterfallColorHeaderItemKey } from "../../../../utils/uiConfigHelpers/waterfallChartUiConfigHelper.js";

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
        const { item, colorPalette, showCustomPicker } = this.props;
        const coloredItem: IColoredItem = item ? item : null;

        if (!coloredItem) {
            return this.renderLoadingItem();
        }

        const headerItem: IMappingHeader = coloredItem.mappingHeader;
        const headerText = this.getText(headerItem);

        return (
            <ColorDropdown
                selectedColorItem={coloredItem.colorItem}
                colorPalette={colorPalette}
                onColorSelected={this.onColorSelected}
                showCustomPicker={showCustomPicker}
            >
                <ColoredItemContent text={headerText} color={coloredItem.color} />
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
        const { intl } = this.props;
        const headerText = getMappingHeaderFormattedName(mappingHeader) || "";

        if (headerText === null || headerText === "") {
            return `(${getTranslation("empty_value", intl)})`;
        }
        return isWaterfallColorHeaderItemKey(headerText) ? getTranslation(headerText, intl) : headerText;
    }
}

export default injectIntl(ColoredItem);
