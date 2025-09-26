// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { IColor, IColorPalette } from "@gooddata/sdk-model";
import { IMappingHeader, getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { ChartFillConfig, PatternFillName } from "@gooddata/sdk-ui-vis-commons";

import ColoredItemContent from "./ColoredItemContent.js";
import { IColoredItem } from "../../../../interfaces/Colors.js";
import { getTranslation } from "../../../../utils/translations.js";
import { isWaterfallColorHeaderItemKey } from "../../../../utils/uiConfigHelpers/waterfallChartUiConfigHelper.js";
import ColorDropdown from "../colorDropdown/ColorDropdown.js";

export interface IColoredItemProps {
    colorPalette: IColorPalette;
    className?: string;
    item?: IColoredItem;
    onSelect?: (source: IColoredItem, color: IColor) => void;
    isSelected?: boolean;
    disabled?: boolean;
    chartFill?: ChartFillConfig;
    patternFillIndex?: number | PatternFillName;
}

const ColoredItem = memo(function ColoredItem(props: IColoredItemProps & WrappedComponentProps) {
    const { item, colorPalette, intl, onSelect, chartFill, patternFillIndex } = props;

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

    const coloredItem: IColoredItem = item || null;

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
            chartFill={chartFill}
            patternFillIndex={patternFillIndex}
        >
            <ColoredItemContent
                text={headerText}
                color={coloredItem.color}
                chartFill={chartFill?.type}
                patternFillIndex={patternFillIndex}
            />
        </ColorDropdown>
    );
});

export default injectIntl(ColoredItem);
