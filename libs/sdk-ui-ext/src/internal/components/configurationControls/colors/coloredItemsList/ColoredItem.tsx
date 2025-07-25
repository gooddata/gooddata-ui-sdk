// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";
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

const ColoredItem = memo(function ColoredItem(props: IColoredItemProps & WrappedComponentProps) {
    const { item, colorPalette, showCustomPicker = false, intl, onSelect } = props;

    const renderLoadingItem = () => {
        return <div className="gd-list-item gd-list-item-not-loaded" />;
    };

    const onColorSelected = (color: IColor) => {
        if (onSelect) {
            onSelect(item, color);
        }
    };

    const getText = (mappingHeader: IMappingHeader) => {
        const headerText = getMappingHeaderFormattedName(mappingHeader) || "";

        if (headerText === null || headerText === "") {
            return `(${getTranslation("empty_value", intl)})`;
        }
        return isWaterfallColorHeaderItemKey(headerText) ? getTranslation(headerText, intl) : headerText;
    };

    const coloredItem: IColoredItem = item ? item : null;

    if (!coloredItem) {
        return renderLoadingItem();
    }

    const headerItem: IMappingHeader = coloredItem.mappingHeader;
    const headerText = getText(headerItem);

    return (
        <ColorDropdown
            selectedColorItem={coloredItem.colorItem}
            colorPalette={colorPalette}
            onColorSelected={onColorSelected}
            showCustomPicker={showCustomPicker}
        >
            <ColoredItemContent text={headerText} color={coloredItem.color} />
        </ColorDropdown>
    );
});

export default injectIntl(ColoredItem);
